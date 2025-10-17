-- CreateEnum
CREATE TYPE "public"."InterviewType" AS ENUM ('IN_PERSON', 'VIDEO', 'PHONE');

-- CreateEnum
CREATE TYPE "public"."InterviewStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED');

-- AlterTable
ALTER TABLE "public"."Interview" ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "meetingLink" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "status" "public"."InterviewStatus" NOT NULL DEFAULT 'SCHEDULED',
ADD COLUMN     "type" "public"."InterviewType" NOT NULL DEFAULT 'IN_PERSON';
