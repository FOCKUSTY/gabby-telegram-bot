/*
  Warnings:

  - A unique constraint covering the columns `[topicId]` on the table `UserTopic` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "UserTopic_topicId_key" ON "UserTopic"("topicId");
