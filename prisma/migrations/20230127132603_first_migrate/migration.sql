-- CreateEnum
CREATE TYPE "PostVisibility" AS ENUM ('PUBLIC', 'UNLISTED', 'FOLLOWER', 'DIRECT');

-- CreateTable
CREATE TABLE "User" (
    "id" CHAR(26) NOT NULL,
    "handle" TEXT,
    "hostId" CHAR(26) NOT NULL,
    "displayName" TEXT,
    "title" TEXT,
    "biography" TEXT,
    "location" TEXT,
    "isBot" BOOLEAN NOT NULL DEFAULT false,
    "isManualFollow" BOOLEAN NOT NULL DEFAULT false,
    "isManualFollowBot" BOOLEAN NOT NULL DEFAULT false,
    "isSilence" BOOLEAN NOT NULL DEFAULT false,
    "isSuspend" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Host" (
    "id" CHAR(26) NOT NULL,
    "fqdn" VARCHAR(256) NOT NULL,
    "name" TEXT,
    "description" TEXT,

    CONSTRAINT "Host_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserKey" (
    "id" CHAR(26) NOT NULL,
    "publicKey" TEXT,
    "privateKey" TEXT,
    "keyId" TEXT NOT NULL,

    CONSTRAINT "UserKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAuth" (
    "id" CHAR(26) NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "UserAuth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" CHAR(26) NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "color" CHAR(6) NOT NULL DEFAULT '000000',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "flag" BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" CHAR(26) NOT NULL,
    "authorId" CHAR(26) NOT NULL,
    "cw" TEXT,
    "body" TEXT,
    "visibility" "PostVisibility" NOT NULL DEFAULT 'PUBLIC',
    "isLocalOnly" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BelongingRoles" (
    "A" CHAR(26) NOT NULL,
    "B" CHAR(26) NOT NULL
);

-- CreateTable
CREATE TABLE "_VisiblePosts" (
    "A" CHAR(26) NOT NULL,
    "B" CHAR(26) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_handle_hostId_key" ON "User"("handle", "hostId");

-- CreateIndex
CREATE UNIQUE INDEX "Host_fqdn_key" ON "Host"("fqdn");

-- CreateIndex
CREATE UNIQUE INDEX "UserKey_keyId_key" ON "UserKey"("keyId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAuth_email_key" ON "UserAuth"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_BelongingRoles_AB_unique" ON "_BelongingRoles"("A", "B");

-- CreateIndex
CREATE INDEX "_BelongingRoles_B_index" ON "_BelongingRoles"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_VisiblePosts_AB_unique" ON "_VisiblePosts"("A", "B");

-- CreateIndex
CREATE INDEX "_VisiblePosts_B_index" ON "_VisiblePosts"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "Host"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserKey" ADD CONSTRAINT "UserKey_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAuth" ADD CONSTRAINT "UserAuth_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BelongingRoles" ADD CONSTRAINT "_BelongingRoles_A_fkey" FOREIGN KEY ("A") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BelongingRoles" ADD CONSTRAINT "_BelongingRoles_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VisiblePosts" ADD CONSTRAINT "_VisiblePosts_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VisiblePosts" ADD CONSTRAINT "_VisiblePosts_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
