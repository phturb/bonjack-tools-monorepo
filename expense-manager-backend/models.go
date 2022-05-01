package main

import (
    "time"
)

type Bill struct {
    ID uint `json:"ID"`
    Name string `json:"name"`
    CreatedAt time.Time `json:"createdAt"`
}

type Bills struct {
    ID uint `gorm:"primaryKey;autoIncrement:true" json:"ID"`
    Name string `json:"name"`
    CreatedAt time.Time `json:"createdAt"`
    Users []Users `gorm:"foreignKey:BillID;references:ID;constraint:OnDelete:CASCADE" json:"users"`
    Expenses []Expenses `gorm:"foreignKey:BillID;references:ID;constraint:OnDelete:CASCADE" json:"expenses"`
}

type Category struct {
    Name string `json:"name"`
}

type Categories struct {
    Name string `gorm:"primaryKey" json:"name"`
}

type User struct {
    ID uint `json:"ID"`
    BillID uint `json:"billID"`
    Nickname string `json:"nickname"`
    FullName string `json:"fullName"`
}

type Users struct {
    ID uint `gorm:"primaryKey;autoIncrement:true" json:"ID"`
    BillID uint
    Nickname string `json:"nickname"`
    FullName string `json:"fullName"`
    UsersExpenses []UsersExpenses `gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE" json:"usersExpenses"`
}

type Expense struct {
    ID uint `json:"ID"`
    Name string `json:"name"`
    Description string `json:"description"`
    CreatedAt time.Time `json:"createdAt"`
    Price int `json:"price"`
    PayedBy User `json:"user"`
    Categories []Category `json:"categories"`
    UsersExpenses []UserExpense `json:"userExpense"`
}

type Expenses struct {
    ID uint `gorm:"primaryKey;autoIncrement:true" json:"ID"`
    BillID uint `json:"billID"`
    Name string `json:"name"`
    Description string `json:"description"`
    CreatedAt time.Time `json:"createdAt"`
    Price int `json:"price"`
    PayedBy uint `json:"payedBy"`
    PayedByUser Users `gorm:"foreignKey:PayedBy;references:ID;constraint:OnDelete:CASCADE" json:"payedByUser"`
    Categories []Categories `gorm:"many2many:expenses_categories" json:"categories"`
    UsersExpenses []UsersExpenses `gorm:"foreignKey:ExpenseID;references:ID;constraint:OnDelete:CASCADE" json:"usersExpenses"`

}

type UserExpense struct {
    ExpenseID uint `json:"expenseID"`
    UserID uint `json:"userID"`
    User User `json:"user"`
    BillID uint `json:"billID"`
    Proportion uint `json:"proportion"`
}

type UsersExpenses struct {
    ExpenseID uint `gorm:"primaryKey;autoIncrement:false" json:"expenseID"`
    UserID uint `gorm:"primaryKey;autoIncrement:false" json:"userID"`
    User Users `gorm:"foreignKey:UserID;references:ID" json:"user"`
    Proportion uint `json:"proportion"`
}


