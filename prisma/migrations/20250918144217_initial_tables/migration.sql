-- CreateTable
CREATE TABLE `carddefault` (
    `id_card_default` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(100) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id_card_default`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coment` (
    `id_comment` INTEGER NOT NULL AUTO_INCREMENT,
    `id_card` INTEGER NOT NULL,
    `id_user` INTEGER NOT NULL,
    `description` LONGTEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `coment_id_card_fkey`(`id_card`),
    INDEX `coment_id_user_fkey`(`id_user`),
    PRIMARY KEY (`id_comment`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_reset_tokens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `password_reset_tokens_token_key`(`token`),
    INDEX `password_reset_tokens_token_idx`(`token`),
    INDEX `password_reset_tokens_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trip` (
    `id_trip` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(100) NOT NULL,
    `thumb` VARCHAR(200) NULL,
    `description` LONGTEXT NULL,
    `start_date` DATETIME(3) NULL,
    `end_date` DATETIME(3) NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `user_id` INTEGER NULL,

    INDEX `trip_user_id_fkey`(`user_id`),
    PRIMARY KEY (`id_trip`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tripcard` (
    `id_trip_card` INTEGER NOT NULL AUTO_INCREMENT,
    `id_trip` INTEGER NOT NULL,
    `id_card_default` INTEGER NOT NULL,
    `title` VARCHAR(200) NULL,
    `description` LONGTEXT NULL,

    INDEX `tripcard_id_card_default_fkey`(`id_card_default`),
    INDEX `tripcard_id_trip_fkey`(`id_trip`),
    PRIMARY KEY (`id_trip_card`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id_user` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `thumb` VARCHAR(200) NULL,
    `password` LONGTEXT NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `user_email_key`(`email`),
    PRIMARY KEY (`id_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usertrips` (
    `id_user_trips` INTEGER NOT NULL AUTO_INCREMENT,
    `id_user` INTEGER NOT NULL,
    `id_trip` INTEGER NOT NULL,

    INDEX `usertrips_id_trip_fkey`(`id_trip`),
    INDEX `usertrips_id_user_fkey`(`id_user`),
    PRIMARY KEY (`id_user_trips`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `coment` ADD CONSTRAINT `coment_id_card_fkey` FOREIGN KEY (`id_card`) REFERENCES `tripcard`(`id_trip_card`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `coment` ADD CONSTRAINT `coment_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `user`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `password_reset_tokens` ADD CONSTRAINT `password_reset_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trip` ADD CONSTRAINT `trip_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tripcard` ADD CONSTRAINT `tripcard_id_card_default_fkey` FOREIGN KEY (`id_card_default`) REFERENCES `carddefault`(`id_card_default`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tripcard` ADD CONSTRAINT `tripcard_id_trip_fkey` FOREIGN KEY (`id_trip`) REFERENCES `trip`(`id_trip`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usertrips` ADD CONSTRAINT `usertrips_id_trip_fkey` FOREIGN KEY (`id_trip`) REFERENCES `trip`(`id_trip`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usertrips` ADD CONSTRAINT `usertrips_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `user`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;
