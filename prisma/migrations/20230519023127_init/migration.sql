-- CreateTable
CREATE TABLE "Contact" (
    "id" SERIAL NOT NULL,
    "wechatId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "friend" BOOLEAN NOT NULL,
    "gender" INTEGER NOT NULL,
    "weixin" TEXT NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bot" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "enableGroup" BOOLEAN NOT NULL DEFAULT true,
    "enablePrivate" BOOLEAN NOT NULL DEFAULT true,
    "groupPrefix" TEXT NOT NULL DEFAULT '',
    "privatePrefix" TEXT NOT NULL DEFAULT '',
    "prompt" TEXT NOT NULL DEFAULT '',
    "acceptText" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "reply" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "raw" TEXT NOT NULL,
    "token" INTEGER NOT NULL,
    "botId" INTEGER NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contact_wechatId_key" ON "Contact"("wechatId");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
