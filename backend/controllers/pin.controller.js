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

const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({ region: 'eu-north-1' });
const BUCKET_NAME = 'anipin-uploads-prod';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 2 * 1024 * 1024;
const MAX_LENGTHS = {
    title: 100,
    description: 500,
    animeName: 150
};

const saveBase64Image = async (imageUrl, keyName) => {
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
    const key = `uploads/${keyName}.${ext}`;

    await s3.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
    }));

    return `https://${BUCKET_NAME}.s3.eu-north-1.amazonaws.com/${key}`;
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
            return 2;
        case "EU":
            return 3;
        case "NA":
            return 4;
        case "SA":
            return 5;
        case "AF":
            return 6;
        case "OC":
            return 7;
        case "AN":
            return 8;
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

        const animes = await searchService.fetchAnimeData(animeName);

        if (!animes.includes(animeName)) {
            return res.status(400).json({ message: "Anime not found in Anilist", animes });
        }

        if (!latitude || !longitude) {
            return res.status(400).json({ message: "Latitude and longitude are required" });
        }

        const regionId = getRegionIdFromCoordinates(latitude, longitude);
        const uniqueId = crypto.randomBytes(6).toString("hex");

        let savedRealUrl, savedAnimeUrl;

        try {
            savedRealUrl  = await saveBase64Image(req.body.realImage,  `${uniqueId}IRL`);
            savedAnimeUrl = await saveBase64Image(req.body.animeImage, `${uniqueId}ANIME`);

            const pin = await Pin.create({
                title,
                description,
                realImageUrl: savedRealUrl,   // full S3 URL
                animeImageUrl: savedAnimeUrl, // full S3 URL
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
        } catch (error) {
            // If something failed, delete any images already uploaded to S3
            for (const url of [savedRealUrl, savedAnimeUrl].filter(Boolean)) {
                const key = url.split('.amazonaws.com/')[1];
                await s3.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key })).catch(() => {});
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

        const userId = req.user?.id;
        if (!userId || pin.userId !== userId) {
            return res.status(403).json({ message: "Not authorized to delete this pin" });
        }

        // Delete images from S3
        const imageUrls = [pin.realImageUrl, pin.animeImageUrl].filter(Boolean);
        await Promise.allSettled(
            imageUrls.map(url => {
                const key = url.split('.amazonaws.com/')[1];
                return s3.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
            })
        );

        await pin.destroy();

        res.status(200).json({ message: "Pin deleted successfully" });

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

        res.status(200).json({ animeCountByRegion });
    } catch (err) {
        next(new BackError(500, err, "ANIME_COUNT_FETCH_ERROR"));
    }
};

module.exports = { createPin, getAllPins, getPinById, updatePin, deletePin, getPinsByUser, getTopAnimes, getAnimeCountByRegion, getRegionIdFromCoordinates, saveBase64Image };