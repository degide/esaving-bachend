/*
  Warnings:

  - You are about to alter the column `requestedAmount` on the `Loan` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `disbursedAmount` on the `Loan` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `totalPayable` on the `Loan` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to alter the column `interestRate` on the `Loan` table. The data in that column could be lost. The data in that column will be cast from `Decimal(5,2)` to `DoublePrecision`.
  - You are about to alter the column `amount` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "Loan" ALTER COLUMN "requestedAmount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "disbursedAmount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "totalPayable" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "interestRate" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;
