/*
  Warnings:

  - You are about to drop the column `autoEnterTopic` on the `UserSettings` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "AdminTopic_topicId_key";

-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "UserSettings" DROP COLUMN "autoEnterTopic",
ADD COLUMN     "sendEnabled" BOOLEAN NOT NULL DEFAULT true;
