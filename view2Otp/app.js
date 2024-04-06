const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../server/models/user"); // Assuming you have a User model
const nodemailer = require("nodemailer");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");
const randomstring = require("randomstring");

const otpMap = new Map();
const resetInProgress = new Map();


const MAIL_USERNAME = process.env.MAIL_USERNAME;
const MAIL_PASSWORD = process.env.MAIL_PASSWORD;

app.use(express.json());

// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware

// nodemailer setup
async function sendResetPasswordEmail(email,otp) {
  try {
    const transporter = await nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: MAIL_USERNAME,
        pass: MAIL_PASSWORD,
      },
    });
    const mailOptions = {
      from: MAIL_USERNAME,
      to: email, 
      subject: "For Reset Password",
      html: `Hii, Youre OTP is  <h1>${otp}</h1>`,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email Has been sent: ", info.response);
      }
    });
  } catch (error) {
    console.log("Error is : ", error);
  }
}

app.get("/", (req, res) => {
  res.render("index", { message: "" });
});

// Send OTP route
app.post("/send-otp",async (req, res) => {
  try {
    const { email } = req.body;

    let userFind = await User.findOne({email:email});
    if(!userFind) return res.status(404).json({message:"User not found"});
    // Generate OTP
    const otp = randomstring.generate({
      length: 6,
      charset: "numeric",
    });

    // Store the OTP with email for verification later
    otpMap.set(email, otp);

    // Send OTP email
    sendResetPasswordEmail(email, otp);

    // Render enter OTP page
    res.render("enter-otp", { email: email });

  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Verify OTP route
app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (otpMap.has(email) && otpMap.get(email) === otp) {
    resetInProgress.set(email, true);
    otpMap.delete(email);
    res.render("reset", { email: email, message: "" });
  } else {
    res.render("index", { message: "Invalid OTP" });
  }
});

// Reset password route
app.post("/reset-password", (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  if (!resetInProgress.has(email)) {
    res.render("index", { message: "Please verify OTP first" });
  } else if (newPassword !== confirmPassword) {
    res.render("reset", { email: email, message: "Passwords do not match" });
  } else {
    console.log(`New password for ${email}: ${newPassword}`);

    // Clear status for email
    resetInProgress.delete(email);

    res.render("password-reset-success", { message: "Password reset successfully" });
  }
});

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/userData")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
