// One-time update of an existing, explicitly authorised product.
// Runs only on the named preview branch; never merge into production source.
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  if (process.env.VERCEL_ENV !== "preview" ||
      process.env.VERCEL_GIT_COMMIT_REF !== "ops/publish-fuschia-day-cream") {
    throw new Error("Refusing to run outside the dedicated preview environment.");
  }
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not available.");
  const slug = "fuschia-day-cream";
  const product = await prisma.product.findUnique({where:{slug}});
  if (!product) throw new Error("The existing Fuschia Day Cream draft was not found.");
  if (product.name !== "Fuschia Day Cream" || product.price !== 850 ||
      product.collection !== "Skin" || !product.image.includes("vercel-storage.com")) {
    throw new Error("Existing product differs from approved details; no changes applied.");
  }
  const currentDetails = product.details && !Array.isArray(product.details) &&
    typeof product.details==="object" ? product.details : {};
  if (product.active && currentDetails.newBadge?.durationDays === 60 &&
      Array.isArray(currentDetails.ingredients) &&
      currentDetails.ingredients.includes("Ocean pearl") &&
      currentDetails.ingredients.includes("Himalayan pink clay") &&
      currentDetails.ingredients.includes("Botanical oils")) {
    console.log("FUSCHIA_ALREADY_PUBLISHED",JSON.stringify({
      slug,price:product.price,stock:product.stock,active:product.active,
      badgeUntil:new Date(Date.parse(currentDetails.newBadge.startedAt)+60*86400000).toISOString(),
    }));
    return;
  }
  if (product.active) throw new Error("Product already active but not configured as expected; refusing overwrite.");
  const details = {
    ...currentDetails,
    ingredients: ["Ocean pearl","Himalayan pink clay","Botanical oils"],
    newBadge: {durationDays:60,startedAt:new Date().toISOString()},
  };
  // Quantity unspecified. null explicitly means no quantity tracking (not zero).
  // Use the admin stock editor when the exact count is available.
  const updated = await prisma.product.update({
    where:{id:product.id},
    data:{active:true,stock:null,details},
  });
  const badgeUntil=new Date(Date.parse(details.newBadge.startedAt)+60*86400000).toISOString();
  console.log("FUSCHIA_PUBLISHED",JSON.stringify({
    slug:updated.slug,name:updated.name,price:updated.price,stock:updated.stock,
    active:updated.active,image:updated.image,
    ingredients:details.ingredients,badgeDays:60,badgeUntil,
  }));
}
main().catch(err=>{console.error("FUSCHIA_PUBLISH_FAILED",err.code||err.name||"error",err.message);process.exitCode=1})
.finally(()=>prisma.$disconnect());
