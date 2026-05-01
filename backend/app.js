const express = require('express')

const sequelize = require('./util/db')

const app = express()

app.use(express.json())

sequelize.authenticate()
    .then(() => {
        console.log('Connection established')
    })
    .catch((error) => {
        console.log(error)
    })

const userRoutes = require('./routes/user.routes')

app.use('/user', userRoutes)

module.exports = app