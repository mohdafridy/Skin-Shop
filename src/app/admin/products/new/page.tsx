import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/admin-auth";
import AdminHeader from "../../AdminHeader";
import ProductEditorForm from "../ProductEditorForm";

export const metadata: Metadata = { title: "Add Product", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AddProductPage() {
  await requireAdminSession();
  return (
    <div className="mx-auto max-w-4xl px-6 py-10 sm:px-8">
      <AdminHeader title="Add a product" />
      <p className="mb-7 text-sm text-walnut/70">Add a product to the live catalog. Publishing a product makes it available in the shop immediately.</p>
      <ProductEditorForm />
    </div>
  );
}
