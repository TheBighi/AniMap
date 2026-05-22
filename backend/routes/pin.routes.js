const express = require('express')
const pinController = require('../controllers/pin.controller');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router()

router.post('/', authMiddleware, pinController.createPin);
router.get('/', pinController.getAllPins);
router.post('/userPins', authMiddleware, pinController.getPinsByUser)
router.get('/:id', pinController.getPinById);
router.put('/:id', authMiddleware, pinController.updatePin);
router.delete('/:id', authMiddleware, pinController.deletePin);

module.exports = router