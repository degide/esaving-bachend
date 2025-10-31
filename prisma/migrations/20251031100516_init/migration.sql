/*
  Warnings:

  - You are about to drop the column `loanInstallmentId` on the `CreditScoreLog` table. All the data in the column will be lost.
  - You are about to drop the `LoanInstallment` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[loanId]` on the table `CreditScoreLog` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[loanId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."CreditScoreLog" DROP CONSTRAINT "CreditScoreLog_loanInstallmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LoanInstallment" DROP CONSTRAINT "LoanInstallment_loanId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LoanInstallment" DROP CONSTRAINT "LoanInstallment_transactionId_fkey";

-- DropIndex
DROP INDEX "public"."CreditScoreLog_loanInstallmentId_key";

-- AlterTable
ALTER TABLE "CreditScoreLog" DROP COLUMN "loanInstallmentId",
ADD COLUMN     "loanId" INTEGER;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "loanId" INTEGER;

-- DropTable
DROP TABLE "public"."LoanInstallment";

-- CreateIndex
CREATE UNIQUE INDEX "CreditScoreLog_loanId_key" ON "CreditScoreLog"("loanId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_loanId_key" ON "Transaction"("loanId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditScoreLog" ADD CONSTRAINT "CreditScoreLog_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
