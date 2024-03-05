/*
  Warnings:

  - Added the required column `updated_at` to the `Counseling` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `DetailCounseling` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Offline` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Online` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `counseling` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `detailcounseling` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `offline` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `online` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;
