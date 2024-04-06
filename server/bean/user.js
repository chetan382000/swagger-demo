const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const nodemailer = require("nodemailer");
require("dotenv").config();

const JWTSECRETKEY = process.env.JWTSECRETKEY;
const MAIL_USERNAME = process.env.MAIL_USERNAME;
const MAIL_PASSWORD = process.env.MAIL_PASSWORD;

const register = async (req, res) => {
  try {
    const { name, email, password, number } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    await User.create({ name, email, password: hashedPassword, number });

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, JWTSECRETKEY, {
      expiresIn: "1h",
    });

    user.token = token;
    await user.save();

    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "-password -token"
    );
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, number } = req.body;
    await User.findByIdAndUpdate(req.user.userId, { name, email, number });
    res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.userId);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// send mail for reset password

async function sendresetpassword(name, email, token) {
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
      // html: `Hii  ${name} Please Reset you password <a href="http://localhost:3000/user/reset-password/${token}"> reset your password</a>`,
      html: `
        <div class="container">
          <h1>Password Reset</h1>
          <p>Hello ${name}</p>
          <p>Please click the button below to reset your password:</p>
          <p style="text-align: center;">
            <a href="http://localhost:3000/user/reset-password/${token}" class="button"><b style="color:blue;">Reset Password (:) http://localhost:3000/user/reset-password/${token}</b></a>
          </p>
          <p>If you did not request a password reset, please ignore this email.</p>
        </div>
      </body>
      </html>
      `,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email Has been sent: ", info.response);
      }
    });
  } catch (error) {
    console.log("Error is : ",error);
  }
}


const getForgotPassword = async (req, res) => {
  try {
    res.render('forgotPassword');
  } catch (err) {
    res.status(500).json({ message: "Server error",err });
  }
};

async function forgotPassword(req, res, next) {
  try {
   console.log('start')

    let email = req.body.email;
   console.log(email)
    let userEmail = await User.findOne({ email:email });
    if (!userEmail) return res.status(404).json({ message: "User not found :(" });
    console.log('1')

    let tokenGenerate = await jwt.sign({userId: userEmail._id,},JWTSECRETKEY);
   
    let tokenUpdate = await User.updateOne({ email },{ $set: { token: tokenGenerate }});

    sendresetpassword(userEmail.name, userEmail.email, tokenGenerate);

    res.status(200).json({ message: "Mail Has Send Successfully :)" });
  } catch (err) {
    return res.status(500).json({ message: "Enternal server error",err });
  }
}

const getResetPassword = async (req, res) => {
  try {
    const token = req.params.token;
    res.render("resetPassword",{token});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

async function resetPassword(req, res, next) {
  try {
    let token = req.params.token;
    let user = await User.findOne({ token });
    if (!user)
      return res.status(404).json({ message: "Invalid or expired token" });
      let { password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    let hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
   
    user.token = "";
    await user.save();
    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  register,
  login,
  getUser,
  updateUser,
  deleteUser,
  getForgotPassword,
  forgotPassword,
  getResetPassword,
  resetPassword
};
