/*
  Warnings:

  - You are about to alter the column `projectId` on the `invite` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - A unique constraint covering the columns `[projectId,email]` on the table `Invite` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Invite_email_key` ON `invite`;

-- AlterTable
ALTER TABLE `invite` MODIFY `projectId` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Invite_projectId_email_key` ON `Invite`(`projectId`, `email`);
