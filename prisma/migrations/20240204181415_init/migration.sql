/*
  Warnings:

  - The primary key for the `chat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `counseling` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `otp` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `room` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `chat` DROP FOREIGN KEY `Chat_id_room_fkey`;

-- DropForeignKey
ALTER TABLE `chat` DROP FOREIGN KEY `Chat_id_user_fkey`;

-- DropForeignKey
ALTER TABLE `detailcounseling` DROP FOREIGN KEY `DetailCounseling_id_counseling_fkey`;

-- DropForeignKey
ALTER TABLE `detailcounseling` DROP FOREIGN KEY `DetailCounseling_id_user_fkey`;

-- DropForeignKey
ALTER TABLE `offline` DROP FOREIGN KEY `Offline_id_counseling_fkey`;

-- DropForeignKey
ALTER TABLE `online` DROP FOREIGN KEY `Online_id_counseling_fkey`;

-- DropForeignKey
ALTER TABLE `online` DROP FOREIGN KEY `Online_id_room_fkey`;

-- DropForeignKey
ALTER TABLE `otp` DROP FOREIGN KEY `Otp_id_user_fkey`;

-- AlterTable
ALTER TABLE `chat` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `id_room` VARCHAR(191) NOT NULL,
    MODIFY `id_user` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `counseling` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `detailcounseling` MODIFY `id_counseling` VARCHAR(191) NOT NULL,
    MODIFY `id_user` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `offline` MODIFY `id_counseling` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `online` MODIFY `id_counseling` VARCHAR(191) NOT NULL,
    MODIFY `id_room` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `otp` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `id_user` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `room` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `user` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_id_room_fkey` FOREIGN KEY (`id_room`) REFERENCES `Room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetailCounseling` ADD CONSTRAINT `DetailCounseling_id_counseling_fkey` FOREIGN KEY (`id_counseling`) REFERENCES `Counseling`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetailCounseling` ADD CONSTRAINT `DetailCounseling_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Online` ADD CONSTRAINT `Online_id_counseling_fkey` FOREIGN KEY (`id_counseling`) REFERENCES `Counseling`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Online` ADD CONSTRAINT `Online_id_room_fkey` FOREIGN KEY (`id_room`) REFERENCES `Room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Offline` ADD CONSTRAINT `Offline_id_counseling_fkey` FOREIGN KEY (`id_counseling`) REFERENCES `Counseling`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Otp` ADD CONSTRAINT `Otp_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
