package main

import (
	"net/http"
    "github.com/gin-gonic/gin"
)

func GETBills(c *gin.Context) {

    bills, err := GetBills()
    if err != nil {
        panic(err)
    }
    c.JSON(http.StatusOK, bills)
}

func POSTBills(c *gin.Context) {
    var billInput struct { Name string `json:"name"` }
    if err := c.ShouldBindJSON(&billInput); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error() })
        return
    }
    bill, err := CreateBill(billInput.Name)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error() })
        return
    }
    c.JSON(http.StatusOK, bill)
    return
}

func GETBills_billId(c *gin.Context) {
    billId, err := parseParamId("billId", c)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error() })
        return
    }
    bill, err := GetBill(billId)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error() })
        return
    }
    c.JSON(http.StatusOK, bill)
    return
}

func DELETEBills_billId(c *gin.Context) {
    billId, err := parseParamId("billId", c)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error() })
        return
    }
    err = DeleteBill(billId)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error() })
        return
    }
    c.JSON(http.StatusNoContent, nil)
    return
}

func GETBills_billId_Users(c *gin.Context) {
    billId, err := parseParamId("billId", c)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error() })
        return
    }
    users, err := GetUsersFromBill(billId)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error() })
        return
    }

    c.JSON(http.StatusOK, users)
    return
}

func POSTBills_billId_Users(c *gin.Context) {
    billId, err := parseParamId("billId", c)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error() })
    }
    var userInput struct {
        NickName string `json:"nickname"`
        FullName string `json:"fullName"`
    }
    if err := c.ShouldBindJSON(&userInput); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error() })
        return
    }
    user, err := CreateUser(uint(billId), userInput.NickName, userInput.FullName, false)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error() })
        return
    }
    c.JSON(http.StatusOK, user)
    return
}

func DELETEBills_billId_Users_userId(c *gin.Context) {
    billId, err := parseParamId("billId", c)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error() })
        return
    }
    userId, err := parseParamId("userId", c)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error() })
        return
    }
    err = DeleteUser(billId, userId)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error() })
        return
    }
    c.JSON(http.StatusNoContent, nil)
}

func POSTBills_billId_Expenses(c *gin.Context) {
    billId, err := parseParamId("billId", c)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error() })
    }
    var expenseInput struct {
        Name string `json:"name"`
        Description string `json:"description"`
        PayedBy uint `json:"payedBy"`
        Price int `json:"price"`
        Categories []Categories `json:"categories"`
    }
    if err := c.ShouldBindJSON(&expenseInput); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error() })
        return
    }
    expense, err := CreateExpense(billId, expenseInput.Name, expenseInput.Description, expenseInput.Price, expenseInput.PayedBy, expenseInput.Categories )

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error() })
        return
    }
    c.JSON(http.StatusOK, expense)
    return
}

func GETBills_billId_Expenses(c *gin.Context) {
    billId, err := parseParamId("billId", c)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    expenses, err := GetExpenses(billId)

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, expenses)
    return
}

func PUTBills_billId(c *gin.Context) {
    billId, err := parseParamId("billId", c)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    var bill Bills
    if err := c.ShouldBindJSON(&bill); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error() })
        return
    }
    bill.ID = billId
    err = UpdateBill(&bill)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
    }
    c.String(http.StatusOK, "NOT IMPLEMENTED")
    return
}

func PUTBills_billId_Users_userId(c *gin.Context) {
    billId, err := parseParamId("billId", c)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    userId, err := parseParamId("userId", c)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    var user Users
    if err := c.ShouldBindJSON(&user); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    user.BillID = billId
    user.ID = userId

    err = UpdateUser(&user)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.String(http.StatusOK, "NOT IMPLEMENTED")
    return
}
func GETBills_billId_Expenses_expenseId(c *gin.Context) {
    billId, err := parseParamId("billId", c)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    expenseId, err := parseParamId("expenseId", c)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    _, err = GetExpense(billId, expenseId)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.String(http.StatusOK, "NOT IMPLEMENTED")
    return
}
func PUTBills_billId_Expenses_expenseId(c *gin.Context) {
    billId, err := parseParamId("billId", c)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    expenseId, err := parseParamId("expenseId", c)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    var expense Expenses
    if err := c.ShouldBindJSON(&expense); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    expense.BillID = billId
    expense.ID = expenseId

    err = UpdateExpense(&expense)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.String(http.StatusOK, "NOT IMPLEMENTED")
    return
}
func GETBills_billId_Expenses_expenseId_UsersExpenses(c *gin.Context) {
    billId, err := parseParamId("billId", c)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    expenseId, err := parseParamId("expenseId", c)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    _, err = GetUsersExpenses(billId, expenseId)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.String(http.StatusOK, "NOT IMPLEMENTED")
    return
}
func GETBills_billId_Expenses_expenseId_UsersExpenses_userId(c *gin.Context) {
    billId, err := parseParamId("billId", c)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    expenseId, err := parseParamId("expenseId", c)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    userId, err := parseParamId("userId", c)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    _, err = GetUserExpense(billId, expenseId, userId)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.String(http.StatusOK, "NOT IMPLEMENTED")
    return
}
func PUTBills_billId_Expenses_expenseId_UsersExpenses_userId(c *gin.Context) {
    billId, err := parseParamId("billId", c)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    expenseId, err := parseParamId("expenseId", c)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    userId, err := parseParamId("userId", c)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    var userExpense UsersExpenses
    if err := c.ShouldBindJSON(&userExpense); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    err = VerifyUserExpenseBillId(billId, expenseId, userId)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    userExpense.UserID = userId
    userExpense.ExpenseID = expenseId

    err = UpdateUserExpense(&userExpense)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
    }

    c.String(http.StatusOK, "NOT IMPLEMENTED")
    return
}

func DELETEBills_billId_Expenses_expenseId(c *gin.Context) {
    billId, err := parseParamId("billId", c)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    expenseId, err := parseParamId("expenseId", c)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    err = DeleteExpense(billId, expenseId)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusNoContent, nil)
    return
}

func RegisterBillsRoutes(router *gin.Engine) {
    router.GET("/bills", GETBills)
    router.POST("/bills", POSTBills)

    router.GET("/bills/:billId", GETBills_billId)
    router.DELETE("/bills/:billId", DELETEBills_billId)
    router.PUT("/bills/:billId", PUTBills_billId)

    router.GET("/bills/:billId/users", GETBills_billId_Users)
    router.POST("/bills/:billId/users", POSTBills_billId_Users)
    router.PUT("/bills/:billId/users/:userId", PUTBills_billId_Users_userId)
    router.DELETE("/bills/:billId/users/:userId", DELETEBills_billId_Users_userId)

    router.GET("/bills/:billId/expenses", GETBills_billId_Expenses)
    router.POST("/bills/:billId/expenses", POSTBills_billId_Expenses)
    router.GET("/bills/:billId/expenses/:expenseId", GETBills_billId_Expenses_expenseId)
    router.PUT("/bills/:billId/expenses/:expenseId", PUTBills_billId_Expenses_expenseId)
    router.DELETE("/bills/:billId/expenses/expenseId", DELETEBills_billId_Expenses_expenseId)

    router.GET("/bills/:billId/expenses/:expenseId/usersexpenses", GETBills_billId_Expenses_expenseId_UsersExpenses)
    router.GET("/bills/:billId/expenses/:expenseId/usersexpenses/:userId", GETBills_billId_Expenses_expenseId_UsersExpenses_userId)
    router.PUT("/bills/:billId/expenses/:expenseId/usersexpenses/:userId", PUTBills_billId_Expenses_expenseId_UsersExpenses_userId)
}

func GETCategories(c *gin.Context) {
    categories, err := GetCategories()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, categories)
    return
}

func POSTCategories(c *gin.Context) {
    var category Categories
    if err := c.BindJSON(&category) ; err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    category, err := CreateCategory(category.Name)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, category)
    return
}

func DELETECategories_categoryName(c *gin.Context) {
    name := c.Param("categoryName")
    if name == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Missing param"})
        return
    }

    err := DeleteCategory(name)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusNoContent, nil)
    return
}

func RegisterCategoriesRoutes(router *gin.Engine) {
    router.GET("/categories", GETCategories)

    router.POST("/categories", POSTCategories)

    router.DELETE("/categories/:categoryName", DELETECategories_categoryName)
}
