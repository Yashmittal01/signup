const express = require("express");
const signupModel= require("./models/signup");
const bodyParser = require('body-parser');
const app= express();
const port=3000;
const jwt = require('jsonwebtoken');
const mongoose= require("mongoose");
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());
app.use(express.urlencoded({extended: true}));
const userController= require("./controller/user");
mongoose.connect('mongodb://localhost:27017/login', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

app.get("/",(req,res)=>{
    res.render("index.ejs")
})
app.get("/login",(req,res)=>{
    res.render("login.ejs");
});
app.get("/forget",(req,res)=>{
    res.render("forget.ejs");
});
app.get('/checkUsername/:username', async (req, res) => {
  const username = req.params.username;
  const user = await signupModel.findOne({ username });
  if (user) {
      res.json({ exists: true });
  } else {
      res.json({ exists: false });
  }
});

app.get("/reset-password", userController.reset);
app.post("/signup", userController.signup);
app.post("/login", userController.login);
app.post("/forget", userController.forget);
app.post("/reset-password", userController.postreset);
app.listen(port,()=>{
    console.log(`listening on port ${port}`);
});