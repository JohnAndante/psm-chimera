/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `integrations` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('TELEGRAM', 'EMAIL', 'WEBHOOK');

-- CreateEnum
CREATE TYPE "public"."JobType" AS ENUM ('SYNC_PRODUCTS', 'COMPARE_DATA', 'CLEANUP_LOGS', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."ExecutionStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."IntegrationType" AS ENUM ('RP', 'CRESCEVENDAS', 'TELEGRAM', 'EMAIL', 'WEBHOOK');

-- AlterTable
ALTER TABLE "public"."integrations" ADD COLUMN     "type" "public"."IntegrationType" NOT NULL DEFAULT 'RP',
ALTER COLUMN "base_url" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."notification_channels" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "config" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "notification_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."job_configurations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cron_pattern" TEXT NOT NULL,
    "job_type" "public"."JobType" NOT NULL,
    "config" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "integration_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "job_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."job_executions" (
    "id" TEXT NOT NULL,
    "job_config_id" INTEGER NOT NULL,
    "status" "public"."ExecutionStatus" NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),
    "logs" TEXT,
    "metrics" JSONB,
    "error_details" JSONB,

    CONSTRAINT "job_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."job_notifications" (
    "id" SERIAL NOT NULL,
    "job_config_id" INTEGER NOT NULL,
    "notification_channel_id" INTEGER NOT NULL,
    "on_success" BOOLEAN NOT NULL DEFAULT false,
    "on_failure" BOOLEAN NOT NULL DEFAULT true,
    "on_start" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sync_configurations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "source_integration_id" INTEGER NOT NULL,
    "target_integration_id" INTEGER NOT NULL,
    "notification_channel_id" INTEGER,
    "store_ids" JSONB NOT NULL DEFAULT '[]',
    "schedule" JSONB,
    "options" JSONB NOT NULL DEFAULT '{}',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "sync_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sync_executions" (
    "id" TEXT NOT NULL,
    "sync_config_id" INTEGER,
    "status" "public"."ExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),
    "stores_processed" JSONB NOT NULL,
    "summary" JSONB NOT NULL,
    "comparison_results" JSONB,
    "execution_logs" TEXT,
    "error_details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_executions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notification_channels_name_key" ON "public"."notification_channels"("name");

-- CreateIndex
CREATE UNIQUE INDEX "job_configurations_name_key" ON "public"."job_configurations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "job_notifications_job_config_id_notification_channel_id_key" ON "public"."job_notifications"("job_config_id", "notification_channel_id");

-- CreateIndex
CREATE UNIQUE INDEX "sync_configurations_name_key" ON "public"."sync_configurations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "integrations_name_key" ON "public"."integrations"("name");

-- AddForeignKey
ALTER TABLE "public"."job_configurations" ADD CONSTRAINT "job_configurations_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "public"."integrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_executions" ADD CONSTRAINT "job_executions_job_config_id_fkey" FOREIGN KEY ("job_config_id") REFERENCES "public"."job_configurations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_notifications" ADD CONSTRAINT "job_notifications_job_config_id_fkey" FOREIGN KEY ("job_config_id") REFERENCES "public"."job_configurations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_notifications" ADD CONSTRAINT "job_notifications_notification_channel_id_fkey" FOREIGN KEY ("notification_channel_id") REFERENCES "public"."notification_channels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sync_configurations" ADD CONSTRAINT "sync_configurations_source_integration_id_fkey" FOREIGN KEY ("source_integration_id") REFERENCES "public"."integrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sync_configurations" ADD CONSTRAINT "sync_configurations_target_integration_id_fkey" FOREIGN KEY ("target_integration_id") REFERENCES "public"."integrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sync_configurations" ADD CONSTRAINT "sync_configurations_notification_channel_id_fkey" FOREIGN KEY ("notification_channel_id") REFERENCES "public"."notification_channels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sync_executions" ADD CONSTRAINT "sync_executions_sync_config_id_fkey" FOREIGN KEY ("sync_config_id") REFERENCES "public"."sync_configurations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
