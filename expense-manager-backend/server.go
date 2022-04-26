package main

import (
	_ "encoding/json"
	"fmt"
	"log"
	"os"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/mattn/go-sqlite3"
)


func SetupRouter(router *gin.Engine) {
    RegisterBillsRoutes(router)
    RegisterCategoriesRoutes(router)
}

func RunServer(router *gin.Engine) {
    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }

    fmt.Println("Starting server at port "  + port)

    router.Run(":" + port)
}

func main() {
    // Load environment variables
    err := godotenv.Load()
    if err != nil {
        fmt.Println("Error loading .env file ! Going foward without .env")
    }

    // Connect the database var db is globaly available
    err = ConnectDB()
    if err != nil {
        log.Fatal("Error estabilishing the connection to the Database !")
    }

    err = InitDB()
    if err != nil {
        log.Fatal("Error while initializing DB !")
    }

    router := gin.Default()

    // Add endpoint handling

    SetupRouter(router)

    // Starting server

    RunServer(router)
}
