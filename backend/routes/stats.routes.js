const express = require('express')
const pinController = require('../controllers/pin.controller');

const router = express.Router()

router.get('/top-animes', pinController.getTopAnimes)
router.get('/top-regions', pinController.getAnimeCountByRegion)

module.exports = router