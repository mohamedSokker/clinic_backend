-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "badgeTitle" TEXT,
ADD COLUMN     "patientsCount" INTEGER,
ADD COLUMN     "specialties" TEXT[],
ADD COLUMN     "successRate" INTEGER,
ADD COLUMN     "yearsExperience" INTEGER;
