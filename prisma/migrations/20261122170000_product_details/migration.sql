-- Legacy products keep their editorial content from src/data/products.ts until
-- an administrator edits them. New products persist the full content here.
ALTER TABLE "Product" ADD COLUMN "details" JSONB;
