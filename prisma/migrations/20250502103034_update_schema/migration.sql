-- AlterTable
ALTER TABLE "LoaderRequest" ADD COLUMN     "documentNumber" TEXT;

-- CreateTable
CREATE TABLE "DocumentCounter" (
    "id" TEXT NOT NULL DEFAULT 'document_counter',
    "count" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentCounter_pkey" PRIMARY KEY ("id")
);
