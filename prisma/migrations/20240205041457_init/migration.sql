/*
  Warnings:

  - You are about to alter the column `status` on the `counseling` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `Enum(EnumId(2))`.

*/
-- AlterTable
ALTER TABLE `counseling` ADD COLUMN `note` VARCHAR(191) NULL,
    MODIFY `status` ENUM('waiting', 'approved', 'reject', 'done') NOT NULL DEFAULT 'waiting';
