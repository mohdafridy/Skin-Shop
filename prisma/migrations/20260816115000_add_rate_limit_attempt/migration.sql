-- CreateTable
CREATE TABLE "RateLimitAttempt" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateLimitAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RateLimitAttempt_key_createdAt_idx" ON "RateLimitAttempt"("key", "createdAt");

-- RLS: Prisma's connection role bypasses RLS; this only closes the
-- PostgREST/anon-key exposure path, consistent with every other table.
ALTER TABLE "RateLimitAttempt" ENABLE ROW LEVEL SECURITY;
