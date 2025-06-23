-- CreateEnum
CREATE TYPE "VolunteerStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ProjectStatusType" ADD VALUE 'ProposalApproved';
ALTER TYPE "ProjectStatusType" ADD VALUE 'BudgetApproved';

-- AlterTable
ALTER TABLE "volunteer" ADD COLUMN     "status" "VolunteerStatus" NOT NULL DEFAULT 'Pending';

-- CreateTable
CREATE TABLE "VolunteerForm" (
    "id" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "preferredTask" TEXT NOT NULL,

    CONSTRAINT "VolunteerForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerSkills" (
    "id" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "volunteerFormId" TEXT,

    CONSTRAINT "VolunteerSkills_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VolunteerSkills" ADD CONSTRAINT "VolunteerSkills_volunteerFormId_fkey" FOREIGN KEY ("volunteerFormId") REFERENCES "VolunteerForm"("id") ON DELETE SET NULL ON UPDATE CASCADE;
