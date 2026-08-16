-- Enable RLS on every public table. No policies are added: this app's
-- Postgres role (Supabase's owner-level `postgres` connection, used by
-- Prisma via DATABASE_URL) bypasses RLS entirely, so this has zero effect
-- on the running application. What it does close is Supabase's PostgREST
-- REST API, which is reachable by anyone holding the project's anon key —
-- RLS-disabled + a leaked anon key would mean direct read/write access to
-- every table, bypassing the app's own authorization checks entirely.
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Combo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ComboItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Coupon" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderNotification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NewsletterSubscriber" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProcessedWebhookEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
