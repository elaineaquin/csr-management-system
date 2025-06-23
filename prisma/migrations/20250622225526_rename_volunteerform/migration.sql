/*
  Warnings:

  - You are about to drop the `VolunteerForm` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "VolunteerForm" DROP CONSTRAINT "VolunteerForm_volunteerId_fkey";

-- DropTable
DROP TABLE "VolunteerForm";

-- CreateTable
CREATE TABLE "volunteer_form" (
    "id" TEXT NOT NULL,
    "motivation" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,

    CONSTRAINT "volunteer_form_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "volunteer_form" ADD CONSTRAINT "volunteer_form_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
