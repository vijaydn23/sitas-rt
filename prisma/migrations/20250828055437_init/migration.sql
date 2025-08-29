-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CUSTOMER'
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "Customer_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InchargeCustomer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inchargeId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    CONSTRAINT "InchargeCustomer_inchargeId_fkey" FOREIGN KEY ("inchargeId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InchargeCustomer_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_ownerId_key" ON "Customer"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "InchargeCustomer_inchargeId_customerId_key" ON "InchargeCustomer"("inchargeId", "customerId");
