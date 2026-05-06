const express = require('express')
const cookieParser = require('cookie-parser');

const { notFoundHandler, errorHandler } = require("./middleware/globalErrorHandler");
const authMiddleware = require('./middleware/authMiddleware');

const sequelize = require('./utils/db')

const app = express()
const cors = require('cors');

app.use(express.json())
app.use(cookieParser())

const corsOptions = {
    origin: 'http://localhost:5173',
    methods: 'GET,POST,OPTIONS',
    credentials: true,
}

app.use(cors(corsOptions))

sequelize.authenticate()
    .then(() => {
        console.log('Connection established')
    })
    .catch((error) => {
        console.log(error)
    })

const authRoutes = require('./routes/auth.routes')

app.use('/api/auth', authRoutes)

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app