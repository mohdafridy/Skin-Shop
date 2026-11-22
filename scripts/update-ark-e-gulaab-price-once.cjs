// One-time scoped price correction requested by store owner.
// Preview build only. Never merge this operational script into main.
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  if (process.env.VERCEL_ENV !== "preview" ||
      process.env.VERCEL_GIT_COMMIT_REF !== "ops/price-ark-e-gulaab-380") {
    throw new Error("Price update is restricted to its designated preview build.");
  }
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is unavailable.");
  const p = await prisma.product.findUnique({ where: { slug: "ark-e-gulaab" } });
  if (!p || p.collection !== "Skin" || p.currency !== "INR" ||
      !p.name.toLowerCase().includes("gulaab")) {
    throw new Error("Product identity check failed; refusing to update price.");
  }
  if (p.price === 380) {
    console.log("PRICE_ALREADY_SET",JSON.stringify({slug:p.slug,price:p.price,active:p.active}));
    return;
  }
  const previousPrice=p.price;
  const result=await prisma.product.update({
    where:{id:p.id},
    data:{price:380},
    select:{slug:true,price:true,active:true},
  });
  console.log("PRICE_UPDATED",JSON.stringify({
    slug:result.slug,from:previousPrice,to:result.price,active:result.active,
  }));
}
main().catch(err=>{
  console.error("PRICE_UPDATE_FAILED",err.code||err.name||"error",err.message);
  process.exitCode=1;
}).finally(()=>prisma.$disconnect());
