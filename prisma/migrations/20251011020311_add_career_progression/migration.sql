-- AlterTable
ALTER TABLE "public"."Employee" ADD COLUMN     "salary" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "public"."CareerProgression" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "previousJobTitle" TEXT,
    "newJobTitle" TEXT,
    "previousSalary" DOUBLE PRECISION,
    "newSalary" DOUBLE PRECISION,
    "previousDepartmentId" TEXT,
    "newDepartmentId" TEXT,
    "previousManagerId" TEXT,
    "newManagerId" TEXT,
    "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerProgression_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."CareerProgression" ADD CONSTRAINT "CareerProgression_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CareerProgression" ADD CONSTRAINT "CareerProgression_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "public"."Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
