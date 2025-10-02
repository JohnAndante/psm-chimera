-- CreateEnum
CREATE TYPE "public"."LogLevel" AS ENUM ('DEBUG', 'INFO', 'WARN', 'ERROR', 'SUCCESS');

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "public"."log_entries" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" "public"."LogLevel" NOT NULL,
    "category" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "session_id" TEXT,
    "source" TEXT NOT NULL DEFAULT 'api',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "log_entries_timestamp_idx" ON "public"."log_entries"("timestamp");

-- CreateIndex
CREATE INDEX "log_entries_category_idx" ON "public"."log_entries"("category");

-- CreateIndex
CREATE INDEX "log_entries_level_idx" ON "public"."log_entries"("level");

-- CreateIndex
CREATE INDEX "log_entries_session_id_idx" ON "public"."log_entries"("session_id");

-- CreateIndex
CREATE INDEX "log_entries_created_at_idx" ON "public"."log_entries"("created_at");
