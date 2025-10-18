-- AlterTable
ALTER TABLE "public"."Attendance" ADD COLUMN     "location" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "workHours" DOUBLE PRECISION;
