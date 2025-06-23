/*
  Warnings:

  - Added the required column `volunteerId` to the `VolunteerForm` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VolunteerForm" ADD COLUMN     "volunteerId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "VolunteerForm" ADD CONSTRAINT "VolunteerForm_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
