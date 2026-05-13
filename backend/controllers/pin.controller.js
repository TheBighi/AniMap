const db = require('../models');
const Pin = db.Pin;

const reverse = require("country-reverse-geocoding").country_reverse_geocoding();
const { countries } = require("countries-list");
const { whereAlpha3 } = require("iso-3166-1");

const BackError = require('../utils/error');
const { where } = require('sequelize');

function getRegionIdFromCoordinates(latitude, longitude) {
    const result = reverse.get_country(latitude, longitude);

    const threeLetterCode = result.code;

    let countryCode;
    try {
        const countryData = whereAlpha3(threeLetterCode);
        countryCode = countryData.alpha2;
    } catch (e) {
        return -1;
    }

    if (countryCode == "JP") {
        return 0;
    }

    const country = countries[countryCode];

    if (!country) {
        console.log('failed')
        return -1;
    }
    
    const continentCode = country.continent;

    switch (continentCode) {
        case "AS":
            return 2; // rest of Asia
        case "EU":
            return 3; // EUROPE
        case "NA":
            return 4; // NORTH AMERICA
        case "SA":
            return 5; // SOUTH AMERICA
        case "AF":
            return 6; // AFRICA
        case "OC":
            return 7; // OCEANIA
        case "AN":
            return 8; // ANTARCTICA
        default:
            return -1;
    }
}

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
        } = req.body;

        const userId = req.user?.id; // from authMiddleware

        console.log(userId)

        if (!latitude || !longitude) {
            return res.status(400).json({ message: "Latitude and longitude are required" });
        }

        const regionId = getRegionIdFromCoordinates(latitude, longitude);

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


const getPinsByUser = async (req, res, next) => {

    console.log("HELLO")
    const userId = req.user?.id;

    

    const pins = await Pin.findAll({
        where: { userId: userId }
    })

    if (!pins) {
        return res.status(404).json({message: "Pins by userId not found"})
    }
    return res.status(200).json({ pins: pins })
}

module.exports = { createPin, getAllPins, getPinById, updatePin, deletePin, getPinsByUser }