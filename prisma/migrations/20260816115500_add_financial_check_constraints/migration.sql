-- Defense-in-depth: the app already validates these at the Zod/route level
-- (never trusting client-supplied amounts), but a DB-level backstop costs
-- nothing and protects against any future write path that skips app logic.
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_quantity_positive" CHECK (quantity > 0);
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_amounts_nonnegative" CHECK ("unitPrice" >= 0 AND "lineTotal" >= 0);
ALTER TABLE "ComboItem" ADD CONSTRAINT "ComboItem_quantity_positive" CHECK (quantity > 0);
ALTER TABLE "Product" ADD CONSTRAINT "Product_price_nonnegative" CHECK (price >= 0);
ALTER TABLE "Combo" ADD CONSTRAINT "Combo_price_nonnegative" CHECK (price >= 0);
ALTER TABLE "Order" ADD CONSTRAINT "Order_amounts_nonnegative" CHECK (subtotal >= 0 AND discount >= 0 AND shipping >= 0 AND tax >= 0 AND total >= 0);
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_value_nonnegative" CHECK (value >= 0);
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_minimumSubtotal_nonnegative" CHECK ("minimumSubtotal" IS NULL OR "minimumSubtotal" >= 0);
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_maxDiscount_nonnegative" CHECK ("maxDiscount" IS NULL OR "maxDiscount" >= 0);
