/*
  Warnings:

  - You are about to drop the column `companyLogo` on the `LoaderRequest` table. All the data in the column will be lost.
  - You are about to drop the column `signature` on the `LoaderRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LoaderRequest" DROP COLUMN "companyLogo",
DROP COLUMN "signature";
