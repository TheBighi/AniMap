const express = require('express')
const searchService = require('../services/anilistApi.js')
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router()

router.get('/', searchService.animeService)

module.exports = router