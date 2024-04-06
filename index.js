// app.js
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const userRouter = require("./server/router/index");
const swaggerRouter = require('./swagger')
const path =require('path')

const app = express();
app.use(express.json());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/userData")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));


// Routes
app.use(swaggerRouter);
app.use("/", userRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


