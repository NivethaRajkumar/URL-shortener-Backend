import User from "../Models/UserSchema.js";
import { errorHandler } from "../Utils/Error.js";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import dotenv from "dotenv";
import Randomstring from "randomstring";
import nodemailer from "nodemailer";
dotenv.config();

export const registerUser = async (req, res, next) => {
  const { firstname, lastname, email, password } = req.body;

  if (
    !firstname ||
    !lastname ||
    !email ||
    !password ||
    firstname === "" ||
    lastname === "" ||
    email === "" ||
    password === ""
  ) {
    return next(errorHandler(400, "All the Fields Are Required"));
  }
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({
    firstname,
    lastname,
    email,
    password: hashedPassword,
  });

  try {
    // sending mail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.PASSMAIL,
        pass: process.env.PASSKEY,
      },
    });
    const base = process.env.BASE;
    const ranstring = Randomstring.generate();
    newUser.randomstring = ranstring;
    newUser.isVerified = false;
    await newUser.save();
    const mailOptions = {
      from: process.env.PASSMAIL,
      to: req.body.email,
      subject: "Confirm new user",
      html: `
                <p>Dear ${req.body.firstname} ${req.body.lastname}</p>
                <p>We received a request to create an account. 
                <p>Please click the following link to confirm your registration:</p>
                <a href="${base}/activate-user/${ranstring}">Click here to activate your account</a>
                <p>If you did not make this request, please ignore this email.</p>
                <p>Thank you,</p>
                <p>URL Shortener</p>
              `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({
      message: "Check mail to activate your account",
      result: newUser,
    });
  } catch (error) {
    next(error);
  }
};

export const activateUser = async (req, res, next) => {
  try {
    const randomstring = req.params.str;
    const { email, password } = req.body;
    // console.log("random string", randomstring);
    const userres = await User.findOne({ randomstring });
    //console.log("userres", userres);

    if (userres) {
      const checkstr = userres.randomstring;
      //console.log("checkstr", checkstr);
      if (randomstring == checkstr) {
        if (!email || !password || email === "" || password === "") {
          return next(errorHandler(400, "All the Fields Are Required"));
        }
        if (userres.email === email) {
          const passwordMatch = await bcryptjs.compare(
            password,
            userres.password
          );
          if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid password" });
          }
          userres.randomstring = "";
          userres.isVerified = true;
          userres.save();
          const { password: passkey, ...rest } = userres._doc;
          res
            .status(200)
            .json({ message: "User activated successfully", result: rest });
        } else {
          res.status(404).json({ message: "Email id mismatch" });
        }
      } else {
        res.status(404).json({ message: "Kindly provide correct link" });
      }
    } else {
      res.status(404).json({ message: "Already used the link." });
    }
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password || email === "" || password === "") {
    return next(errorHandler(400, "All the Fields Are Required"));
  }

  try {
    const userDetail = await User.findOne({ email });

    if (!userDetail) {
      return res.status(401).json({ message: "User not found" });
    }
    const isVerified = userDetail.isVerified;
    if (!isVerified) {
      return res.status(401).json({ message: "User is not activated" });
    }
    const passwordMatch = await bcryptjs.compare(password, userDetail.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const token = jwt.sign(
      { id: userDetail._id},
      process.env.JWT_SECRET_KEY
    );
    const { password: passkey, ...rest } = userDetail._doc;
    res
      .status(200)
      .json({ message: "User Logged in Successfully", result: rest,token });
  } catch (error) {
    next(error);
  }
};

export const forgotpassword = async (req, res) => {
  try {
    const { email } = req.body;
    const userinfo = await User.findOne({ email });
    if (!userinfo) {
      return res.status(401).json({ message: "User not found" });
    }
    const isVerified = userinfo.isVerified;
    if (!isVerified) {
      return res.status(401).json({ message: "User is not activated" });
    }
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.PASSMAIL,
        pass: process.env.PASSKEY,
      },
    });
    const base = process.env.BASE;
    const ranstring = Randomstring.generate();
    userinfo.randomstring = ranstring;
    const token = jwt.sign(
      { id: userinfo._id},
      process.env.JWT_SECRET_KEY
    );
    userinfo.save();
    const mailOptions = {
      from: process.env.PASSMAIL,
      to: userinfo.email,
      subject: "Password Reset",
      html: `
                <p>Dear ${userinfo.firstname} ${userinfo.lastname}</p>
                <p>We received a request to reset your password. 
                <p>Please click the following link to reset your password:</p>
                <a href="${base}/reset-password/${ranstring}">Reset Password</a>
                <p>If you did not make this request, please ignore this email.</p>
                <p>Thank you,</p>
                <p>From Validation</p>
              `,
    };

    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ message: "Password reset email sent successfully" ,token});
  } catch (error) {
    //console.log(error);
    res
      .status(500)
      .json({ message: "Internal server error in forgot password" });
  }
};

export const checkrandomstring = async (req, res) => {
  try {
    const randomstring = req.params.str;
    //console.log(randomstring);
    const userres = await User.findOne({ randomstring });
    // console.log(userres);

    if (userres) {
      const checkstr = userres.randomstring;
      // console.log(checkstr);
      if (randomstring == checkstr) {
        res.status(200).json({ message: "", result: userres });
      } else {
        res.status(404).json({ message: "Kindly provide correct link" });
      }
    } else {
      res.status(404).json({ message: "Already used the link." });
    }
  } catch (error) {
    //console.log(error);
    res.status(500).json({ message: "Internal server error in checkstring" });
  }
};

export const resetpassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const resetuser = await User.findOne({ email });
   // console.log(email,resetuser);

    if (!resetuser) {
      return res.status(404).json({ message: "User not found" });
    } else {
      const hashnewPassword = await bcryptjs.hashSync(password, 10);
      const results = await User.updateOne(
        { email: email },
        { email, password: hashnewPassword, randomstring: "" }
      );
      //results.save();
      //console.log(results);
      //const updateduser = await User.find({ email });
      //console.log(updateduser);
      //const { password: passkey, ...rest } = results._doc;
      res.status(200).json({ message: "Password updated successfully" ,});
    }
  } catch (error) {
    //console.log(error);
    res.status(500).json({ message: "Internal server error in resetpassword" });
  }
};