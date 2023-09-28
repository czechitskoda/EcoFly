package server

import (
	"encoding/json"
	"fmt"
	"log"
	"skoda/utils"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/template/html/v2"
	"gorm.io/gorm"
)

var db *gorm.DB
var userDb *gorm.DB
var questions []utils.Question

type Q struct {
  Title string `json:"title"`
  Answers map[string]string `json:"answers"`
  Correct int `json:"correct"`
  Incorrect []int `json:"bad"`
  Index int `json:"index"`
}

type FAns struct {
  Correct int `json:"correct"`
  Bad []int `json:"bad"`
}

type FixJson struct {
  Title string `json:"title"`
  A string `json:"a"`
  B string `json:"b"`
  C string `json:"c"`
  Correct string `json:"correct"`
}



func init() {
  db = utils.Connect()
  userDb = utils.ConnectUser()
  questions = utils.GetAll(db)
}

func UpdateScore(c *fiber.Ctx, changeBy int64) {
    score := c.Cookies("score")
    newScore := fiber.Cookie{}
    newScore.Name = "score"
    num, _ := strconv.ParseInt(score, 0, 0)
    newScore.Value = fmt.Sprint(num + changeBy)
    newScore.Expires = time.Now().Add(24 * time.Hour)
    c.Cookie(&newScore)
}

func SetScore(c *fiber.Ctx) {
    newScore := fiber.Cookie{}
    newScore.Name = "score"
    newScore.Value = "0"
    newScore.Expires = time.Now().Add(24 * time.Hour)
    c.Cookie(&newScore)
}

func FormatQuestion(id int) Q {
  question := questions[id]
  q := Q{}

  q.Title = question.Title
  q.Answers = map[string]string{"a": question.A,"b": question.B,"c": question.C}
  q.Correct = question.Correct
  q.Index = id
  switch correct := q.Correct; correct {
    case 0:
      q.Incorrect = []int{1, 2}
    case 1:
      q.Incorrect = []int{0, 2}
    case 2:
      q.Incorrect = []int{0, 1}
  
  } 
  return q
}

func SendAll(c *fiber.Ctx) error {
  return c.JSON(utils.GetAll(db))
}

func SendLength(c *fiber.Ctx) error {
  return c.JSON(len(questions))
}

func SendByIndex(c *fiber.Ctx) error {
  id, _ := c.ParamsInt("id")
  if id == len(questions) {
    return c.JSON("end")
  }
  formatted := FormatQuestion(id)
  log.Println(utils.Format("0:0:255", formatted.Title))
  return c.JSON(formatted)
}

func Correct(c *fiber.Ctx) error {
  q := c.Queries()
  index, _ := strconv.ParseInt(q["i"], 0, 0)
  answer, _ := strconv.ParseInt(q["a"], 0, 0)
  if index < int64(len(questions)) {
    q := FormatQuestion(int(index))
    correct := q.Correct
    incorrect := q.Incorrect
    if answer == int64(correct) {
      UpdateScore(c, 1)
      log.Println(utils.Format("0:255:0", "User answered correct"))
    } else {
      SetScore(c)
      log.Println(utils.Format("255:0:0", "User answered incorrect"))
    }
    return c.JSON(FAns{Correct: correct, Bad: incorrect})
  }
  return c.JSON(false)
}

func Score(c *fiber.Ctx) error {
  score := c.Cookies("score")
  intScore, _ := strconv.ParseInt(score, 0, 0) 
  return c.JSON(intScore)
}

func Write(c *fiber.Ctx) error {
  var fromJson FixJson
  data := c.Body()
  err := json.Unmarshal(data, &fromJson)

  if err != nil {
    log.Fatal(err)
  }

  intCorrect, _ := strconv.ParseInt(fromJson.Correct, 0, 0)

  q := utils.Question{}
  q.Title = fromJson.Title
  q.A = fromJson.A
  q.B = fromJson.B
  q.C = fromJson.C
  q.Correct = int(intCorrect) 
  utils.Write(q, db)
  return c.JSON("OK")
}

func WriteForm(c *fiber.Ctx) error {
  title := c.FormValue("title")
  correct := c.FormValue("correct")
  ansA := c.FormValue("a")  
  ansB := c.FormValue("b")  
  ansC := c.FormValue("c")  
  intCorrect, _ := strconv.ParseInt(correct, 0, 0)

  q := utils.Question{}
  q.Title = title
  q.A = ansA
  q.B = ansB
  q.C = ansC
  q.Correct = int(intCorrect) 
  utils.Write(q, db)
  return c.Redirect("/form")
}

func Register(c *fiber.Ctx) error {
  var user utils.User
  user.Name = c.FormValue("name")
  user.Password = c.FormValue("password")

  user.Score = "0"

  utils.WriteUser(user, userDb)
  return c.Redirect("/login")
}

func Login(c *fiber.Ctx) error {
  name := c.FormValue("name")
  password := c.FormValue("password")

  dbUser := utils.GetByName(name, userDb)

  if password == dbUser.Password  {
    score := fiber.Cookie{}
    score.Name = "score"
    score.Value = dbUser.Score
    score.Expires = time.Now().Add(24 * time.Hour)
    c.Cookie(&score)
    return c.Redirect("/")
  }
  return c.Redirect("/login")
}

func Listen() {
  engine := html.New("./front", ".html")
  
  app := fiber.New(fiber.Config{
    Views: engine,
  })

  app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))


  app.Post("/api/questions", Write)
  app.Post("/api/questions/form", WriteForm)

  app.Get("/api/questions/length", SendLength)
  app.Get("/api/questions", SendAll)

  app.Get("/api/questions/correct", Correct)
  app.Get("/api/questions/score", Score)

  app.Get("/api/questions/:id", SendByIndex)

  app.Post("/api/register", Register)
  app.Post("/api/login", Login)


  app.Get("/login", func(c *fiber.Ctx) error {
    return c.Render("login", nil)
  })

  app.Get("/register", func(c *fiber.Ctx) error {
    return c.Render("register", nil)
  })

  app.Get("/form", func(c *fiber.Ctx) error {
    return c.Render("post", nil)
  })



  app.Listen(":5526")
}
