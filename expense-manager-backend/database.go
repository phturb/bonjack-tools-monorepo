package main

import (
//	"database/sql"
	"fmt"
	"os"
//	_ "github.com/mattn/go-sqlite3"
    "gorm.io/driver/sqlite"
    "gorm.io/gorm"
)

var db *gorm.DB

func ConnectDB() (err error) {
    databasePath := os.Getenv("DATABASE_PATH")
    if databasePath == "" {
        return fmt.Errorf("DATABASE_PATH is not defined !")
    }
    db, err = gorm.Open(sqlite.Open(databasePath), &gorm.Config{})
    // db, err = sql.Open("sqlite3", databasePath)
    return err
}

func InitDB() (err error) {
    if db == nil {
        return fmt.Errorf("DB is not opened !")
    }

    err = db.AutoMigrate(&Categories{}, Bills{}, &Users{}, &Expenses{}, &UsersExpenses{})


    // _, err := db.Exec("CREATE TABLE IF NOT EXISTS bills (id INT, name TEXT, created_at TIMESTAMP)")
    return
}
