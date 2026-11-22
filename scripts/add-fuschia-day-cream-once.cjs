// One-off, idempotent, scoped draft creation for an explicitly requested product.
// Never merge this script to main; it runs only on the dedicated preview branch.
// Uses existing Vercel environment secrets without reading or printing them.
const { PrismaClient } = require("@prisma/client");
const { put } = require("@vercel/blob");
const { createHash } = require("node:crypto");
const prisma = new PrismaClient();
const slug = "fuschia-day-cream";
const sourceImage = "https://d2ol7oe51mr4n9.cloudfront.net/user_3HollViWAdYDWFSwhL3ZJBfeRxh/f72f6f3f-ef47-4c04-8d33-cbb915fee1d1.jpg";
const expectedHash = "9dd9f86b4e4f677f647c69e6bb2d6b54ce8a0587fee35c8d9ac122a521d05ada";
async function main() {
  if (process.env.VERCEL_ENV !== "preview" ||
      process.env.VERCEL_GIT_COMMIT_REF !== "ops/add-fuschia-day-cream-draft") {
    throw new Error("This one-off script can run only in its designated preview build.");
  }
  if (!process.env.DATABASE_URL || !process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Required managed project database/image storage is unavailable.");
  }
  const existing = await prisma.product.findUnique({where:{slug}});
  if (existing) {
    console.log("PRODUCT_ALREADY_EXISTS",JSON.stringify({
      slug:existing.slug,price:existing.price,stock:existing.stock,active:existing.active,
      hasImage:Boolean(existing.image),badgeDays:existing.details?.newBadge?.durationDays??null,
    }));
    return;
  }
  const res = await fetch(sourceImage,{redirect:"follow"});
  if (!res.ok) throw new Error("Unable to retrieve the provided product image: HTTP "+res.status);
  const bytes = Buffer.from(await res.arrayBuffer());
  const hash = createHash("sha256").update(bytes).digest("hex");
  if (hash !== expectedHash) throw new Error("Product image hash mismatch; refusing to publish a different photo.");
  if (bytes.length>5*1024*1024) throw new Error("Image exceeds expected size.");
  const uploaded = await put("products/fuschia-day-cream-original.jpg",bytes,{
    access:"public",contentType:"image/jpeg",addRandomSuffix:true,
  });
  const details={
    tagline:"A matte-finish day cream with a touch of moisture",
    shortDescription:"A luxurious clay-based day cream with ocean pearl, Himalayan pink clay and botanical oils, providing a matte finish and subtle moisturisation.",
    description:"A luxurious clay-based day cream that blends mineral-rich ocean pearl and Himalayan pink clay with nourishing botanical oils. Fuschia is a blend of high-quality organic ingredients. It provides a matte finish, helps control excess oil and offers subtle moisturisation.",
    size:"30 g",
    suitableFor:"All skin types",
    ingredients:[], // No full ingredient list supplied; do not invent one.
    benefits:["Provides a matte finish","Helps control excess oil","Offers subtle moisturisation"],
    ritual:["Use during the day after washing your face.","Apply gently and tap into the skin."],
    gallery:[uploaded.url],
    related:[],
    ritualTags:["Hydrate"],
    featured:false,
    bestseller:false,
    newBadge:{durationDays:60,startedAt:new Date().toISOString()},
  };
  // No stock quantity was supplied; keep a zero-stock UNPUBLISHED draft.
  // When stock is confirmed, publish and restart the 60-day launch countdown.
  const created=await prisma.product.create({
    data:{
      slug,
      name:"Fuschia Day Cream",
      shortName:"Fuschia Day Cream",
      category:"Day Cream",
      collection:"Skin",
      price:850,
      currency:"INR",
      image:uploaded.url,
      active:false,
      stock:0,
      details,
    },
  });
  console.log("PRODUCT_DRAFT_CREATED",JSON.stringify({
    id:created.id,slug:created.slug,price:created.price,size:details.size,
    stock:created.stock,active:created.active,image:uploaded.url,
    newBadgeDays:details.newBadge.durationDays,
  }));
}
main().catch(err=>{console.error("PRODUCT_DRAFT_CREATE_FAILED",err.code||err.name||"error",err.message);process.exitCode=1})
.finally(()=>prisma.$disconnect());
