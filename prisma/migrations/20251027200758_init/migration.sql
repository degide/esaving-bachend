/*
  Warnings:

  - The values [USER] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `middleName` on the `User` table. All the data in the column will be lost.
  - The `status` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "GeneralStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('SAVINGS', 'SYSTEM_FLOAT', 'SYSTEM_FEES');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'LOAN_DISBURSEMENT', 'LOAN_REPAYMENT', 'PENALTY_PAYMENT', 'INTERNAL_TRANSFER');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REVERSED');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('PENDING', 'APPROVED', 'ACTIVE', 'PAID_OFF', 'REJECTED', 'DEFAULTED');

-- CreateEnum
CREATE TYPE "InstallmentStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE');

-- CreateEnum
CREATE TYPE "CreditFactor" AS ENUM ('INITIAL_SCORE', 'ON_TIME_REPAYMENT', 'LATE_REPAYMENT', 'LOAN_DEFAULT', 'SAVINGS_ACTIVITY', 'SUCCESSFUL_LOAN_CYCLE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('LOAN_STATUS_UPDATE', 'NEW_TRANSACTION', 'PAYMENT_REMINDER', 'PAYMENT_OVERDUE', 'SECURITY_ALERT', 'GENERAL_MESSAGE');

-- AlterEnum
ALTER TYPE "Gender" ADD VALUE 'OTHER';

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('CUSTOMER', 'ADMIN');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'CUSTOMER';
COMMIT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "middleName",
ADD COLUMN     "creditScore" INTEGER NOT NULL DEFAULT 1000,
ALTER COLUMN "firstName" SET DATA TYPE TEXT,
ALTER COLUMN "lastName" SET DATA TYPE TEXT,
ALTER COLUMN "role" SET DEFAULT 'CUSTOMER',
DROP COLUMN "status",
ADD COLUMN     "status" "GeneralStatus" NOT NULL DEFAULT 'PENDING';

-- DropEnum
DROP TYPE "public"."Status";

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "deviceInfo" TEXT,
    "ipAddress" TEXT,
    "status" "GeneralStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "userId" INTEGER,
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "accountType" "AccountType" NOT NULL DEFAULT 'SAVINGS',
    "status" "GeneralStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "reference" TEXT NOT NULL,
    "sourceAccountId" INTEGER NOT NULL,
    "destinationAccountId" INTEGER NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loan" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "requestedAmount" DECIMAL(15,2) NOT NULL,
    "disbursedAmount" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "totalPayable" DECIMAL(15,2) NOT NULL,
    "interestRate" DECIMAL(5,2) NOT NULL,
    "termInMonths" INTEGER NOT NULL,
    "status" "LoanStatus" NOT NULL DEFAULT 'PENDING',
    "approvedById" INTEGER,
    "disbursementDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoanInstallment" (
    "id" SERIAL NOT NULL,
    "loanId" INTEGER NOT NULL,
    "installmentNumber" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "amountDue" DECIMAL(15,2) NOT NULL,
    "principalDue" DECIMAL(15,2) NOT NULL,
    "interestDue" DECIMAL(15,2) NOT NULL,
    "penaltyFeeApplied" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "amountPaid" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "paymentDate" TIMESTAMP(3),
    "status" "InstallmentStatus" NOT NULL DEFAULT 'PENDING',
    "transactionId" INTEGER,

    CONSTRAINT "LoanInstallment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditScoreLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "factor" "CreditFactor" NOT NULL,
    "pointsChanged" INTEGER NOT NULL,
    "description" TEXT,
    "loanInstallmentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditScoreLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "type" "NotificationType" NOT NULL DEFAULT 'GENERAL_MESSAGE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_refreshToken_key" ON "Session"("refreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "Account_accountNumber_key" ON "Account"("accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Account_userId_key" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_reference_key" ON "Transaction"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "LoanInstallment_transactionId_key" ON "LoanInstallment"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "LoanInstallment_loanId_installmentNumber_key" ON "LoanInstallment"("loanId", "installmentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CreditScoreLog_loanInstallmentId_key" ON "CreditScoreLog"("loanInstallmentId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_sourceAccountId_fkey" FOREIGN KEY ("sourceAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_destinationAccountId_fkey" FOREIGN KEY ("destinationAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanInstallment" ADD CONSTRAINT "LoanInstallment_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanInstallment" ADD CONSTRAINT "LoanInstallment_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditScoreLog" ADD CONSTRAINT "CreditScoreLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditScoreLog" ADD CONSTRAINT "CreditScoreLog_loanInstallmentId_fkey" FOREIGN KEY ("loanInstallmentId") REFERENCES "LoanInstallment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
