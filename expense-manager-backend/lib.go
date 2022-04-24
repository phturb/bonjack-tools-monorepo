package main

import (
    "fmt"
)

func CreateBill(name string) (bills Bills, err error) {
    bills = Bills{Name: name}
    err = db.Create(&bills).Error
    return
}

func GetBill(ID uint) (bills Bills, err error) {
    err = db.Model(&Bills{}).Preload("Users").First(&bills, ID).Error
    return
}

func DeleteBill(ID uint) (err error) {
    err = db.Where("id = ?", ID).Delete(&Bills{}).Error
    if err != nil {
        return
    }
    err = DeleteUsersFromBillId(ID)
    if err != nil {
        return
    }
    err = DeleteExpensesFromBillId(ID)
    return
}

func GetBills() (bills []Bills, err error) {
    err = db.Find(&bills).Error
    return
}

func DeleteUsersFromBillId(billID uint) (err error) {
    err = db.Where("bill_id = ?", billID).Delete(&Users{}).Error
    return
}

func DeleteExpensesFromBillId(billID uint) (err error) {
    err = db.Where("bill_id = ?", billID).Delete(&Expenses{}).Error
    return
}

func GetUsersFromBill(billID uint) (users []Users, err error) {
    err = db.Where("bill_id = ?", billID).Find(&users).Error
    return
}

func CreateUser(billID uint, nickname string, fullName string, isLateAddition bool) (users Users, err error) {
    users.Nickname = nickname
    users.FullName = fullName
    users.BillID = billID
    err = db.Create(&users).Error
    if err != nil {
        return
    }
    var expenses []Expenses
    err = db.Where("bill_id = ?").Find(&expenses).Error
    if err != nil {
        return
    }
    proportion := uint(1)
    if isLateAddition {
        proportion = uint(0)
    }
    for _, expense := range expenses {
        err = db.Create(&UsersExpenses{
            ExpenseID: expense.ID,
            UserID: users.ID,
            Proportion: proportion,
        }).Error
        if err != nil {
            return
        }
    }

    return
}

func DeleteUser(billId uint, userID uint) (err error) {
    err = db.Where("bill_id = ? AND user_id = ?", billId, userID).Delete(&UsersExpenses{}).Error
    if err != nil {
        return
    }
    err = db.Where("bill_id = ? AND payed_by = ?", billId, userID).Delete(&Expenses{}).Error
    if err != nil {
        return
    }
    err = db.Where("bill_id = ? AND id = ?", billId, userID).Delete(&Users{}).Error
    return
}


func CreateExpense(billID uint, name string, description string, price int, payedBy uint, categories []Categories) (expenses Expenses, err error) {
    var count int64
    err = db.Model(&Expenses{}).Where("bill_id = ?", billID).Count(&count).Error
    if err != nil {
        return
    }
    expenses.ID = uint(count)
    expenses.Name = name
    expenses.Description = description
    expenses.Price = price
    expenses.PayedBy = payedBy
    expenses.Categories = categories

    var users []Users
    err = db.Where("bill_id = ?", billID).Find(&users).Error
    if err != nil {
        return
    }

    expenses.UsersExpenses = make([]UsersExpenses, len(users))
    for i, u := range users {
        var ue UsersExpenses
        ue.UserID = u.ID
        ue.Proportion = 1
        expenses.UsersExpenses[i] = ue
    }

    err = db.Create(&expenses).Error
    return
}

func GetExpenses(billID uint) (expenses []Expenses, err error) {
    err = db.Where(map[string]interface{}{"bill_ID": billID}).Preload("Users").Preload("UsersExpenses").Find(&expenses).Error
    return
}

func DeleteExpense(billID uint, expenseID uint) (err error) {
    db.Delete(&Expenses{ID: expenseID})

    if db.RowsAffected < 1 {
        err = fmt.Errorf("No rows affected !")
        return
    }
    return
}

func CalculateBillUsersValue(bill_ID uint) {
    //expenses, err := GetExpenses(bill_ID)
    //if err != nil {
        //return
    //}
    //users, err := GetUsersFromBill(bill_ID)
    //if err != nil {
        //return
    //}
    //type Key [2]int
    //var value = make(map[Key]int)
    //var oweTo = make(map[Key]map[Key]int)
    //var oweFrom = make(map[Key]map[Key]int)
    //for _, user := range users {
        //value[Key{user.BillID, user.ID}] = 0
        //oweTo[Key{user.BillID, user.ID}] = make(map[Key]int)
        //oweFrom[Key{user.BillID, user.ID}] = make(map[Key]int)
        //for _, oweUser := range users {
            //oweTo[Key{user.BillID, user.ID}][Key{oweUser.BillID, oweUser.ID}] = 0
        //}
    //}

    //for _, expense := range expenses {
        //currentValue := value[Key{expense.PayedBy.BillID, expense.PayedBy.ID}]
        //value[Key{expense.PayedBy.BillID, expense.PayedBy.ID}] = currentValue - expense.Price
        //var totalProportion int
        //for _, ue := range expense.UsersExpenses {
            //totalProportion += ue.Proportion
        //}
        //for _, ue := range expense.UsersExpenses {
            //oweTo[Key{ue.BillID, ue.UserID}][Key{expense.BillID, expense.PayedBy.ID}] += expense.Price * 100 / totalProportion * ue.Proportion / 100
            //oweFrom[Key{expense.BillID, expense.PayedBy.ID}][Key{ue.BillID, ue.UserID}] = oweTo[Key{ue.BillID, ue.UserID}][Key{expense.BillID, expense.PayedBy.ID}]
        //}
    //}
}


func AdjustUserExpenseProportion(billID uint, expenseID uint, userID uint, proportion uint) {
    // TODO : Adjust proportion for an expense
    // Return bill_ID, expense_ID, user_ID
}

func AddCategoryToExpense(billID uint, expenseID uint, category string) (err error) {
    var count int64
    err = db.Model(&Expenses{}).Where("bill_id = ? and expense_id = ?", billID, expenseID).Count(&count).Error
    if err != nil {
        return
    }
    if count <= 0 {
        return
    }
    err = db.Model(&Expense{}).Association("Categories").Append(&Categories{Name: category})
    if err != nil {
        return
    }
    return
}

func RemoveCategoryFromExpense(billID uint, expenseID uint, name string) (err error) {
    db.Model(&Expenses{}).Where("id = ? and bill_id = ?", billID, expenseID).Association("Categories").Delete(&Categories{Name: name})
    if db.RowsAffected < 1 {
        err = db.Error
    }
    return
}

func GetCategories() (categories []Category, err error) {
    err = db.Find(&categories).Error
    return
}

func GetCategory(name string) (categories Categories, err error) {
    err = db.First(&categories, name).Error
    return
}

func CreateCategory(name string) (categories Categories, err error) {
    err = db.Create(&categories).Error
    return
}

func DeleteCategory(name string) (err error) {
    db.Delete(&Categories{Name: name})
    if db.RowsAffected < 1 {
        err = fmt.Errorf("No rows were affected !")
    }
    return
}
