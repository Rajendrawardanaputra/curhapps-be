/*
  Warnings:

  - Added the required column `type` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `chat` ADD COLUMN `type` ENUM('message', 'document', 'video', 'photo', 'audio') NOT NULL;
