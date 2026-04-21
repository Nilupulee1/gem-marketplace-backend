"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGem = exports.updateGem = exports.getGemById = exports.getApprovedGems = exports.getMyGems = exports.createGem = void 0;
const Gem_1 = __importDefault(require("../models/Gem"));
const types_1 = require("../types");
const createGem = async (req, res) => {
    try {
        console.log('📦 Received gem creation request');
        console.log('👤 User:', req.user);
        console.log('📝 Body:', req.body);
        console.log('📁 Files:', req.files);
        const files = req.files;
        if (!files || !files.images || files.images.length === 0) {
            return res.status(400).json({ message: 'At least one image is required' });
        }
        if (!files.certificate || files.certificate.length === 0) {
            return res.status(400).json({ message: 'Certificate is required' });
        }
        const gemImages = files.images;
        const certificateFile = files.certificate[0];
        console.log('🖼️  Images uploaded:', gemImages.map(img => img.path));
        console.log('📄 Certificate uploaded:', certificateFile.path);
        const imageUrls = gemImages.map(img => img.path);
        const certificateUrl = certificateFile.path;
        const gemData = {
            seller: req.user.userId,
            type: req.body.type,
            carat: parseFloat(req.body.carat),
            cut: req.body.cut,
            clarity: req.body.clarity,
            color: req.body.color,
            origin: req.body.origin,
            description: req.body.description,
            images: imageUrls,
            certificate: {
                url: certificateUrl,
                authority: req.body.certificateAuthority,
                certificateNumber: req.body.certificateNumber
            },
            status: types_1.GemStatus.PENDING
        };
        console.log('💎 Creating gem with data:', gemData);
        const gem = new Gem_1.default(gemData);
        await gem.save();
        console.log('✅ Gem created successfully:', gem._id);
        res.status(201).json({
            message: 'Gem uploaded successfully and pending approval',
            gem
        });
    }
    catch (error) {
        console.error('❌ Error creating gem:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({
            message: 'Server error',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
exports.createGem = createGem;
const getMyGems = async (req, res) => {
    try {
        console.log('📋 Fetching gems for user:', req.user?.userId);
        const gems = await Gem_1.default.find({ seller: req.user.userId })
            .sort({ createdAt: -1 });
        console.log('✅ Found gems:', gems.length);
        res.json({ gems });
    }
    catch (error) {
        console.error('❌ Error fetching gems:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
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
        console.error('❌ Error fetching approved gems:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};
exports.getApprovedGems = getApprovedGems;
const getGemById = async (req, res) => {
    try {
        const gem = await Gem_1.default.findById(req.params.id)
            .populate('seller', 'name email');
        if (!gem) {
            return res.status(404).json({ message: 'Gem not found' });
        }
        res.json({ gem });
    }
    catch (error) {
        console.error('❌ Error fetching gem:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};
exports.getGemById = getGemById;
const updateGem = async (req, res) => {
    try {
        const gem = await Gem_1.default.findById(req.params.id);
        if (!gem) {
            return res.status(404).json({ message: 'Gem not found' });
        }
        // Only allow seller to update their own gem
        if (gem.seller.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'You can only update your own gems' });
        }
        // Only allow updates to pending or rejected gems
        if (gem.status === types_1.GemStatus.APPROVED) {
            return res.status(400).json({ message: 'Cannot update approved gems' });
        }
        const allowedUpdates = ['type', 'carat', 'cut', 'clarity', 'color', 'origin', 'description'];
        const updates = Object.keys(req.body);
        updates.forEach(update => {
            if (allowedUpdates.includes(update)) {
                gem[update] = req.body[update];
            }
        });
        // Reset status to pending after update
        gem.status = types_1.GemStatus.PENDING;
        gem.adminFeedback = undefined;
        await gem.save();
        console.log('✅ Gem updated:', gem._id);
        res.json({
            message: 'Gem updated successfully',
            gem
        });
    }
    catch (error) {
        console.error('❌ Error updating gem:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};
exports.updateGem = updateGem;
const deleteGem = async (req, res) => {
    try {
        const gem = await Gem_1.default.findById(req.params.id);
        if (!gem) {
            return res.status(404).json({ message: 'Gem not found' });
        }
        // Only allow seller to delete their own gem
        if (gem.seller.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'You can only delete your own gems' });
        }
        // Check if gem is being used in an active auction
        // You can add this check if needed
        await Gem_1.default.findByIdAndDelete(req.params.id);
        console.log('✅ Gem deleted:', req.params.id);
        res.json({ message: 'Gem deleted successfully' });
    }
    catch (error) {
        console.error('❌ Error deleting gem:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};
exports.deleteGem = deleteGem;
