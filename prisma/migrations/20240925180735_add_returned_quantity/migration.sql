-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Request" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "equipmentType" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "returnedQuantity" INTEGER NOT NULL DEFAULT 0,
    "purpose" TEXT NOT NULL,
    "pickupDate" DATETIME NOT NULL,
    "returnDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "campus" TEXT NOT NULL,
    CONSTRAINT "Request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Request_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Request" ("campus", "createdAt", "equipmentId", "equipmentType", "id", "pickupDate", "purpose", "quantity", "returnDate", "status", "updatedAt", "userId") SELECT "campus", "createdAt", "equipmentId", "equipmentType", "id", "pickupDate", "purpose", "quantity", "returnDate", "status", "updatedAt", "userId" FROM "Request";
DROP TABLE "Request";
ALTER TABLE "new_Request" RENAME TO "Request";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
