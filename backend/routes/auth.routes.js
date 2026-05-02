const express = require('express')
const authController = require('../controllers/auth.controller')
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router()

router.get('/health', authMiddleware, authController.healthCheck)
router.post('/register', authController.register)
router.post('/login', authController.login)


module.exports = router