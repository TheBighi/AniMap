const db = require('../models');
const Pin = db.Pin;

const BackError = require('../utils/error');

// CREATE PIN
const createPin = async (req, res, next) => {
    try {
        const {
            title,
            description,
            realImageUrl,
            animeImageUrl,
            animeName,
            latitude,
            longitude,
            regionId
        } = req.body;

        const userId = req.user?.id; // from authMiddleware

        const pin = await Pin.create({
            title,
            description,
            realImageUrl,
            animeImageUrl,
            animeName,
            latitude,
            longitude,
            regionId,
            userId
        });

        res.status(201).json({
            message: "Pin created successfully",
            pin
        });
    } catch (err) {
        next(new BackError(500, err, "PIN_CREATE_ERROR"));
    }
};

// GET ALL PINS
const getAllPins = async (req, res, next) => {
    try {
        const pins = await Pin.findAll();

        res.status(200).json({
            count: pins.length,
            pins
        });
    } catch (err) {
        next(new BackError(500, err, "PIN_FETCH_ERROR"));
    }
};

// GET PIN BY ID
const getPinById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const pin = await Pin.findByPk(id);

        if (!pin) {
            return res.status(404).json({ message: "Pin not found" });
        }

        res.status(200).json(pin);
    } catch (err) {
        next(new BackError(500, err, "PIN_FETCH_ONE_ERROR"));
    }
};

// UPDATE PIN
const updatePin = async (req, res, next) => {
    try {
        const { id } = req.params;

        const pin = await Pin.findByPk(id);

        if (!pin) {
            return res.status(404).json({ message: "Pin not found" });
        }

        const updatedPin = await pin.update(req.body);

        res.status(200).json({
            message: "Pin updated successfully",
            updatedPin
        });

    } catch (err) {
        next(new BackError(500, err, "PIN_UPDATE_ERROR"));
    }
};

// DELETE PIN
const deletePin = async (req, res, next) => {
    try {
        const { id } = req.params;

        const pin = await Pin.findByPk(id);

        if (!pin) {
            return res.status(404).json({ message: "Pin not found" });
        }

        await pin.destroy();

        res.status(200).json({
            message: "Pin deleted successfully"
        });

    } catch (err) {
        next(new BackError(500, err, "PIN_DELETE_ERROR"));
    }
};

module.exports = { createPin, getAllPins, getPinById, updatePin, deletePin }