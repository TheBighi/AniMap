const express = require('express')
const userController = require('../controllers/user.controller')

const router = express.Router()

router.get('/health', userController.healthCheck)

module.exports = router