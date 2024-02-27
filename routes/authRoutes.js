const express = require('express');
const User = require('../models/user');
const authRouter = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middlewares/verifyToken');


authRouter.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields are required."
        });
    }
    try {
        const user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({
                success: false,
                message: "Email already exist."
            });
        }

        const securePassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: securePassword
        });

        await newUser.save();
        return res.status(201).json({
            success: true,
            message: "Registration Successfull."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

authRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields are required."
        });
    }
    try {
        const userExist = await User.findOne({ email });

        if (!userExist) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }
        const comparePassword = await bcrypt.compare(password, userExist.password);

        if (!comparePassword) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password!"
            });
        }
        const token = jwt.sign({ id: userExist._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.cookie('jwt', token, {
            httpOnly: true,
        });

        return res.status(200).json({
            success: true,
            message: "Login Successfull.",
            user:{
                id:userExist._id,
                name:userExist.name,
                email:userExist.email
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
            
        });
    }
});

authRouter.get("/logout", async (req, res) => {
    try {
        res.clearCookie('jwt', { expiresIn: new Date(Date.now())});
        return res.status(200).json({
            success: true,
            message: "Logout Successfull."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


authRouter.get("/user", verifyToken, async (req, res) => {
    try {
        const userId = req.id;

        const userExist = await User.findById(userId);

        if (!userExist) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }
        return res.status(200).json({
            success: true,
            message: "User found.",
            user:{
                id:userExist._id,
                name:userExist.name,
                email:userExist.email
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});



module.exports = authRouter