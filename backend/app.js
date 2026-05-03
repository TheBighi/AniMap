const express = require('express')

const { notFoundHandler, errorHandler } = require("./middleware/globalErrorHandler");
const authMiddleware = require('./middleware/authMiddleware');

const sequelize = require('./utils/db')

const app = express()

app.use(express.json())

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