const db = require('../models');
const Pin = db.Pin;

const fs = require('fs').promises;
const path = require("path");
const crypto = require("crypto");

const reverse = require("country-reverse-geocoding").country_reverse_geocoding();
const { countries } = require("countries-list");

const BackError = require('../utils/error');

function getRegionIdFromCoordinates(latitude, longitude) {
    const result = reverse.get_country(longitude, latitude);

    if (!result) {
        return -1;
    }

    let countryCode = result.code;

    if (countryCode == "JPN") {
        return 0;
    }

    if (result.code == "EST") {
        countryCode = 'EE'
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

const saveBase64Image = async (imageUrl, destPathWithoutExt) => {
    const mimeType = imageUrl.split(";")[0].split(":")[1];
    const ext = mimeType.split("/")[1];
    const destPath = `${destPathWithoutExt}.${ext}`;
    const base64Data = imageUrl.split(",")[1];
    await fs.writeFile(destPath, base64Data, "base64");
    return destPath;
};

const createPin = async (req, res, next) => {
    try {
        const {
            title,
            description,
            anime: animeName,
            latitude,
            longitude,
        } = req.body;

        const userId = req.user?.id; // from authMiddleware

        if (!latitude || !longitude) {
            return res.status(400).json({ message: "Latitude and longitude are required" });
        }

        const regionId = getRegionIdFromCoordinates(latitude, longitude);

        const uploadsDir = path.join(__dirname, "../uploads");
        await fs.mkdir(uploadsDir, { recursive: true });

        const uniqueId = crypto.randomBytes(6).toString("hex");

        const savedRealPath  = await saveBase64Image(req.body.realImage,  path.join(uploadsDir, `${uniqueId}IRL`));
        const savedAnimePath = await saveBase64Image(req.body.animeImage, path.join(uploadsDir, `${uniqueId}ANIME`));

        const realImageStored  = `/uploads/${path.basename(savedRealPath)}`;
        const animeImageStored = `/uploads/${path.basename(savedAnimePath)}`;

        const pin = await Pin.create({
            title,
            description,
            realImageUrl: realImageStored,
            animeImageUrl: animeImageStored,
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