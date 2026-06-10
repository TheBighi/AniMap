const db = require('../models');
const Pin = db.Pin;
const Region = db.Region;

const fs = require('fs').promises;
const path = require("path");
const crypto = require("crypto");

const reverse = require("country-reverse-geocoding").country_reverse_geocoding();
const { countries } = require("countries-list");
const { whereAlpha3 } = require("iso-3166-1");

const BackError = require('../utils/error');
const { where, Op } = require('sequelize');

const searchService = require('../services/anilistApi.js')

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 2 * 1024 * 1024;
const MAX_LENGTHS = {
    title: 100,
    description: 500,
    animeName: 150
};

const saveBase64Image = async (imageUrl, destPathWithoutExt) => {
    const mimeType = imageUrl.split(";")[0].split(":")[1];
    if (!ALLOWED_TYPES.includes(mimeType)) {
        throw new Error("Invalid image type");
    }
    const base64Data = imageUrl.split(",")[1];
    const buffer = Buffer.from(base64Data, 'base64');
    if (buffer.length > MAX_SIZE_BYTES) {
        throw new Error("Image too large");
    }
    const ext = mimeType.split("/")[1];
    const destPath = `${destPathWithoutExt}.${ext}`;
    await fs.writeFile(destPath, buffer); // write the buffer directly, no need for base64Data again
    return destPath;
};

function getRegionIdFromCoordinates(latitude, longitude) {
    const result = reverse.get_country(latitude, longitude);

    if (!result || !result.code) {
        console.log(`No country found for coordinates: ${latitude}, ${longitude}`);
        return -1; 
    }

    const threeLetterCode = result.code;

    let countryCode;
    try {
        const countryData = whereAlpha3(threeLetterCode);
        countryCode = countryData.alpha2;
    } catch (e) {
        return -1;
    }

    if (countryCode == "JP") {
        return 1;
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
            anime: animeName,
            latitude,
            longitude,
        } = req.body;

        const userId = req.user?.id;

        if (title?.length > MAX_LENGTHS.title) {
            return res.status(400).json({ message: `Title must be under ${MAX_LENGTHS.title} characters` });
        }
        if (description?.length > MAX_LENGTHS.description) {
            return res.status(400).json({ message: `Description must be under ${MAX_LENGTHS.description} characters` });
        }
        if (animeName?.length > MAX_LENGTHS.animeName) {
            return res.status(400).json({ message: `Anime name must be under ${MAX_LENGTHS.animeName} characters` });
        }

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const cooldownPeriod = 30 * 1000;
        const SecondsAgo = new Date(Date.now() - cooldownPeriod);

        const recentPin = await Pin.findOne({
            where: {
                userId: userId,
                createdAt: {
                    [Op.gte]: SecondsAgo
                }
            }
        });

        if (recentPin) {
            return res.status(429).json({ 
                message: "Too many requests. Please wait 30 seconds between uploading pins." 
            });
        }

        console.log(userId)

        const animes = await searchService.fetchAnimeData(animeName);

        if (!animes.includes(animeName)) {
            return res.status(400).json({ message: "Anime not found in Anilist", animes });
        }

        if (!latitude || !longitude) {
            return res.status(400).json({ message: "Latitude and longitude are required" });
        }

        const regionId = getRegionIdFromCoordinates(latitude, longitude);

        const uploadsDir = path.join(__dirname, "../uploads");
        await fs.mkdir(uploadsDir, { recursive: true });

        const uniqueId = crypto.randomBytes(6).toString("hex");

        let savedRealPath, savedAnimePath;

        try{
            savedRealPath  = await saveBase64Image(req.body.realImage,  path.join(uploadsDir, `${uniqueId}IRL`));
            savedAnimePath = await saveBase64Image(req.body.animeImage, path.join(uploadsDir, `${uniqueId}ANIME`));

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

            console.log(pin)

            res.status(201).json({
                message: "Pin created successfully",
                pin
            });
        } catch (error) {
            for (const p of [savedRealPath, savedAnimePath].filter(Boolean)) {
                await fs.unlink(p).catch(() => {});
            }
            next(new BackError(500, error, "PIN_CREATE_ERROR"));
        }
    } catch (err) {
        next(new BackError(500, err, "PIN_CREATE_ERROR"));
    }
};

// GET ALL PINS
const getAllPins = async (req, res, next) => {
    try {
        const whereClause = {};

        const { startDate, endDate } = req.query;
        if (startDate || endDate) {
            whereClause.createdAt = {};
            if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
            if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
        }

        const pins = await Pin.findAll({ where: whereClause });

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

        // Only allow the owner to update the pin
        const userId = req.user?.id;
        if (!userId || pin.userId !== userId) {
            return res.status(403).json({ message: "Not authorized to edit this pin" });
        }

        const { title, description, animeName } = req.body;

        if (title?.length > MAX_LENGTHS.title) {
            return res.status(400).json({ message: `Title must be under ${MAX_LENGTHS.title} characters` });
        }
        if (description?.length > MAX_LENGTHS.description) {
            return res.status(400).json({ message: `Description must be under ${MAX_LENGTHS.description} characters` });
        }

        const animes = await searchService.fetchAnimeData(animeName);

        if (!animes.includes(animeName)) {
            return res.status(400).json({ message: "Anime not found in Anilist", animes });
        }

        const updatedPin = await pin.update({ title, description, animeName });

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

        // Only allow the owner to delete the pin
        const userId = req.user?.id;
        if (!userId || pin.userId !== userId) {
            return res.status(403).json({ message: "Not authorized to delete this pin" });
        }

        // Delete associated image files
        const uploadsDir = path.join(__dirname, "../uploads");
        const imagePaths = [pin.realImageUrl, pin.animeImageUrl].filter(Boolean);

        await Promise.allSettled(
            imagePaths.map(imgUrl => {
                const filename = path.basename(imgUrl);
                const filepath = path.join(uploadsDir, filename);
                return fs.unlink(filepath);
            })
        );

        await pin.destroy();

        res.status(200).json({
            message: "Pin deleted successfully"
        });

    } catch (err) {
        next(new BackError(500, err, "PIN_DELETE_ERROR"));
    }
};


const getPinsByUser = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const pins = await Pin.findAll({ where: { userId } });
        if (!pins) {
            return res.status(404).json({ message: "Pins by userId not found" });
        }
        return res.status(200).json({ pins });
    } catch (err) {
        next(new BackError(500, err, "PIN_FETCH_USER_ERROR"));
    }
};

const getTopAnimes = async (req, res, next) => {
    const limit = 10 // for now
    try {
        const topAnimes = await Pin.findAll({
            attributes: ['animeName', [db.Sequelize.fn('COUNT', db.Sequelize.col('animeName')), 'count']],
            group: ['animeName'],
            order: [[db.Sequelize.literal('count'), 'DESC']],
            limit: 10
        });

        res.status(200).json({ topAnimes });
    } catch (err) {
        next(new BackError(500, err, "TOP_ANIMES_FETCH_ERROR"));
    }
}

const getAnimeCountByRegion = async (req, res, next) => {
    try {
        const animeCountByRegion = await Pin.findAll({
            attributes: [
                'regionId',
                [db.Sequelize.fn('COUNT', db.Sequelize.col('Pin.animeName')), 'count']
            ],
            include: [
                {
                    model: Region,
                    attributes: ['name'],
                    required: true
                }
            ],
            group: ['Pin.regionId', 'Region.id', 'Region.name'],
            order: [[db.Sequelize.literal('count'), 'DESC']],
            raw: true,
            nest: true
        });

        console.log(animeCountByRegion)

        res.status(200).json({ animeCountByRegion });
    } catch (err) {
        next(new BackError(500, err, "ANIME_COUNT_FETCH_ERROR"));
    }
};

module.exports = { createPin, getAllPins, getPinById, updatePin, deletePin, getPinsByUser, getTopAnimes, getAnimeCountByRegion, getRegionIdFromCoordinates, saveBase64Image};