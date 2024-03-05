-- DropForeignKey
ALTER TABLE `otp` DROP FOREIGN KEY `OTP_id_user_fkey`;

-- AddForeignKey
ALTER TABLE `Otp` ADD CONSTRAINT `Otp_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
