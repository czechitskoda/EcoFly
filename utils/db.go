package utils

import (
	"log"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type Question struct {
  gorm.Model
  Title string `json:"title"`
  A string `json:"a"`
  B string `json:"b"`
  C string `json:"c"`
  Correct int `json:"correct"`
}

type User struct {
  gorm.Model
  Name string `json:"name"`
  Password string `json:"password"`
  Score string
}

func Connect() *gorm.DB {
  db, err := gorm.Open(sqlite.Open("questions.db"), &gorm.Config{})
  if err != nil {
    log.Fatal(err)
  }
  db.AutoMigrate(&Question{})
  return db
}

func Write(q Question, db *gorm.DB) {
  db.Create(&q)
}

func GetAll(db *gorm.DB) []Question {
  var questions []Question
  results := db.Find(&questions)
  
  if results.Error != nil {
    log.Fatal(results.Error)
  }
  return questions
}

func ConnectUser() *gorm.DB {
  db, err := gorm.Open(sqlite.Open("users.db"), &gorm.Config{})
  if err != nil {
    log.Fatal(err)
  }
  db.AutoMigrate(&User{})
  return db
}

func WriteUser(u User, db *gorm.DB) {
  db.Create(&u)
}

func GetByName(name string, db *gorm.DB) (user User) {
  db.Where("name = ?", name).First(&user)
  return
}

func CheckName(name string, db *gorm.DB) (bool) {
  return GetByName(name, db).Name == ""
}

