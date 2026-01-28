"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGemById = exports.getApprovedGems = exports.getMyGems = exports.createGem = void 0;
const Gem_1 = __importDefault(require("../models/Gem"));
const types_1 = require("../types");
const createGem = async (req, res) => {
    try {
        const images = req.files;
        const certificateFile = images.find(f => f.fieldname === 'certificate');
        const gemImages = images.filter(f => f.fieldname === 'images');
        if (!certificateFile) {
            return res.status(400).json({ message: 'Certificate is required' });
        }
        const gemData = {
            ...req.body,
            seller: req.user.userId,
            images: gemImages.map(img => img.path),
            certificate: {
                url: certificateFile.path,
                authority: req.body.certificateAuthority,
                certificateNumber: req.body.certificateNumber
            },
            status: types_1.GemStatus.PENDING
        };
        const gem = new Gem_1.default(gemData);
        await gem.save();
        res.status(201).json({
            message: 'Gem uploaded successfully and pending approval',
            gem
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.createGem = createGem;
const getMyGems = async (req, res) => {
    try {
        const gems = await Gem_1.default.find({ seller: req.user.userId }).sort({ createdAt: -1 });
        res.json({ gems });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getMyGems = getMyGems;
const getApprovedGems = async (req, res) => {
    try {
        const { type, minCarat, maxCarat, origin } = req.query;
        const filter = { status: types_1.GemStatus.APPROVED };
        if (type)
            filter.type = type;
        if (origin)
            filter.origin = origin;
        if (minCarat || maxCarat) {
            filter.carat = {};
            if (minCarat)
                filter.carat.$gte = Number(minCarat);
            if (maxCarat)
                filter.carat.$lte = Number(maxCarat);
        }
        const gems = await Gem_1.default.find(filter)
            .populate('seller', 'name email')
            .sort({ createdAt: -1 });
        res.json({ gems });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getApprovedGems = getApprovedGems;
const getGemById = async (req, res) => {
    try {
        const gem = await Gem_1.default.findById(req.params.id).populate('seller', 'name email');
        if (!gem) {
            return res.status(404).json({ message: 'Gem not found' });
        }
        res.json({ gem });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getGemById = getGemById;
