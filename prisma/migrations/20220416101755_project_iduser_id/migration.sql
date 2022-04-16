/*
  Warnings:

  - A unique constraint covering the columns `[projectId,userId]` on the table `Token` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Token_projectId_userId_key` ON `Token`(`projectId`, `userId`);
