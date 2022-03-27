sqlite3 $1 "CREATE TABLE \"player\" (
    id VARCHAR(255) PRIMARY KEY NOT NULL,
    name VARCHAR(255)
);"

sqlite3 $1 "CREATE TABLE \"game\" (
    id INTEGER PRIMARY KEY,
    player1Id VARCHAR(255),
    player2Id VARCHAR(255),
    player3Id VARCHAR(255),
    player4Id VARCHAR(255),
    player5Id VARCHAR(255),
    FOREIGN KEY (\"player1Id\") REFERENCES \"player\"(id),
    FOREIGN KEY (\"player2Id\") REFERENCES \"player\"(id),
    FOREIGN KEY (\"player3Id\") REFERENCES \"player\"(id),
    FOREIGN KEY (\"player4Id\") REFERENCES \"player\"(id),
    FOREIGN KEY (\"player5Id\") REFERENCES \"player\"(id)
);"

sqlite3 $1 "CREATE TABLE \"roll\" (
    gameId INTEGER NOT NULL,
    rollNumber INTEGER NOT NULL,
    player1Roll VARCHAR(255),
    player2Roll VARCHAR(255),
    player3Roll VARCHAR(255),
    player4Roll VARCHAR(255),
    player5Roll VARCHAR(255),
    PRIMARY KEY (\"gameId\", \"rollNumber\"),
    FOREIGN KEY (\"gameId\") REFERENCES \"game\"(id)
);"