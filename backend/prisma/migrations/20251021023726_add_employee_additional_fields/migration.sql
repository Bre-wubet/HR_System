/*
  Warnings:

  - You are about to drop the `CandidateDocument` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."CandidateDocument" DROP CONSTRAINT "CandidateDocument_candidateId_fkey";

-- AlterTable
ALTER TABLE "public"."Employee" ADD COLUMN     "address" TEXT,
ADD COLUMN     "benefitsPackage" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "emergencyContact" JSONB,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "payFrequency" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "state" TEXT;

-- DropTable
DROP TABLE "public"."CandidateDocument";
