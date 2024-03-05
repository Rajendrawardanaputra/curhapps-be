-- AlterTable
ALTER TABLE `counseling` MODIFY `status` ENUM('waiting', 'approved', 'reject', 'rejected', 'done') NOT NULL DEFAULT 'waiting';
