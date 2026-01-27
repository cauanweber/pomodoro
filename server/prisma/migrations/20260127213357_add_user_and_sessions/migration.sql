/*
  Warnings:

  - Added the required column `duration` to the `PomodoroSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `PomodoroSession` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PomodoroType" AS ENUM ('FOCUS', 'BREAK');

-- DropForeignKey
ALTER TABLE "PomodoroSession" DROP CONSTRAINT "PomodoroSession_userId_fkey";

-- AlterTable
ALTER TABLE "PomodoroSession" ADD COLUMN     "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "type" "PomodoroType" NOT NULL;

-- AddForeignKey
ALTER TABLE "PomodoroSession" ADD CONSTRAINT "PomodoroSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
