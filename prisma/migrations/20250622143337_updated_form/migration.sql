/*
  Warnings:

  - You are about to drop the column `contact` on the `VolunteerForm` table. All the data in the column will be lost.
  - You are about to drop the column `preferredTask` on the `VolunteerForm` table. All the data in the column will be lost.
  - You are about to drop the `VolunteerSkills` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `experience` to the `VolunteerForm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `motivation` to the `VolunteerForm` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "VolunteerSkills" DROP CONSTRAINT "VolunteerSkills_volunteerFormId_fkey";

-- AlterTable
ALTER TABLE "VolunteerForm" DROP COLUMN "contact",
DROP COLUMN "preferredTask",
ADD COLUMN     "experience" TEXT NOT NULL,
ADD COLUMN     "motivation" TEXT NOT NULL;

-- DropTable
DROP TABLE "VolunteerSkills";
