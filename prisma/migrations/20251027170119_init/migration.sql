-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'DELETED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "gender" "Gender",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'ACTIVE';
