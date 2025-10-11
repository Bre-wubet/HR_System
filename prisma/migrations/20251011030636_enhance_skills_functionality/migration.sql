/*
  Warnings:

  - Added the required column `updatedAt` to the `Certification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Skill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SkillAssignment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Certification" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "credentialId" TEXT,
ADD COLUMN     "documentUrl" TEXT,
ADD COLUMN     "renewalReminder" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedById" TEXT;

-- AlterTable
ALTER TABLE "public"."Skill" ADD COLUMN     "category" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subcategory" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."SkillAssignment" ADD COLUMN     "assessedAt" TIMESTAMP(3),
ADD COLUMN     "assessedById" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "evidence" TEXT,
ADD COLUMN     "isSelfAssessed" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "public"."SkillLevel" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CertificationSkill" (
    "id" TEXT NOT NULL,
    "certificationId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CertificationSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."JobPostingSkill" (
    "id" TEXT NOT NULL,
    "jobPostingId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "minLevel" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPostingSkill_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."SkillAssignment" ADD CONSTRAINT "SkillAssignment_assessedById_fkey" FOREIGN KEY ("assessedById") REFERENCES "public"."Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SkillLevel" ADD CONSTRAINT "SkillLevel_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "public"."Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Certification" ADD CONSTRAINT "Certification_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "public"."Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CertificationSkill" ADD CONSTRAINT "CertificationSkill_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "public"."Certification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CertificationSkill" ADD CONSTRAINT "CertificationSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "public"."Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobPostingSkill" ADD CONSTRAINT "JobPostingSkill_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "public"."JobPosting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobPostingSkill" ADD CONSTRAINT "JobPostingSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "public"."Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
