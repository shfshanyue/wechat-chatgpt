/*
  Warnings:

  - Added the required column `contactId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactName` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "contactId" TEXT NOT NULL,
ADD COLUMN     "contactName" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("wechatId") ON DELETE RESTRICT ON UPDATE CASCADE;
