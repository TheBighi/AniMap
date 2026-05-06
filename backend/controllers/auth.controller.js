const db = require('../models');
const User = db.User;

const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs')

const BackError = require('../utils/error');

const dotenv = require("dotenv");
dotenv.config()

const healthCheck = async (req, res, next) => {
    try {
        const users = await User.findAll();
        res.status(200).json({
            message: 'ok',
            userCount: users.length
        });
    } catch (err) {
        next(new BackError(500, err, "INTERNAL_SERVER_ERROR"))
        res.status(500).json({ error: err.message });
    }
};

const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body

        let user = await User.findOne({
            where: { email: email}
        });

        if (user) return res.status(400).json({ msg: 'User already exists' });

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        user = await User.create({
            username: username,
            email: email,
            password_hash: hashedPassword
        })

        res.status(201).json({ message: 'user reg successful'})
    }
    catch(err){
        next(new BackError(500, err, "INTERNAL_SERVER_ERROR"))
    }
}

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body

        let existingUser;

        try {
            existingUser = await User.findOne({
                where: { email: email }
            })
        }
        catch (err){
            next(new BackError(500, err, "INTERNAL_SERVER_ERROR"))
        }

        if (!existingUser) {
            return res.status(400).json({ message: 'User not found'})
        }

        const isMatch = await bcrypt.compare(password, existingUser.password_hash)
        if (!isMatch) {
            return res.status(400).json({message: 'Invalid creds'})
        }

        const token = jwt.sign(
            { id: existingUser.id, email: existingUser.email},
            process.env.JWT_SECRET,
            { expiresIn: '5h' }
        )

        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'Lax',
            maxAge: 5 * 60 * 60 * 1000
        });
        console.log(existingUser.username)
        res.json({ message: 'Logged in successfully', username: existingUser.username })
    }

    catch (err) {
        next(new BackError(500, err, "INTERNAL_SERVER_ERROR"))
    }
}

module.exports = { healthCheck, register, login };