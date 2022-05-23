-- CreateTable
CREATE TABLE "game" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "player1Id" TEXT,
    "player2Id" TEXT,
    "player3Id" TEXT,
    "player4Id" TEXT,
    "player5Id" TEXT,
    CONSTRAINT "game_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "player" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "game_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "player" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "game_player3Id_fkey" FOREIGN KEY ("player3Id") REFERENCES "player" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "game_player4Id_fkey" FOREIGN KEY ("player4Id") REFERENCES "player" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "game_player5Id_fkey" FOREIGN KEY ("player5Id") REFERENCES "player" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "player" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT
);

-- CreateTable
CREATE TABLE "roll" (
    "gameId" INTEGER NOT NULL,
    "rollNumber" INTEGER NOT NULL,
    "player1Roll" TEXT,
    "player2Roll" TEXT,
    "player3Roll" TEXT,
    "player4Roll" TEXT,
    "player5Roll" TEXT,

    PRIMARY KEY ("gameId", "rollNumber"),
    CONSTRAINT "roll_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);
