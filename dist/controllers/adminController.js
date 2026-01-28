"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatistics = exports.getAllUsers = exports.reviewGem = exports.getPendingGems = void 0;
const Gem_1 = __importDefault(require("../models/Gem"));
const User_1 = __importDefault(require("../models/User"));
const types_1 = require("../types");
const getPendingGems = async (req, res) => {
    try {
        const gems = await Gem_1.default.find({ status: types_1.GemStatus.PENDING })
            .populate('seller', 'name email')
            .sort({ createdAt: -1 });
        res.json({ gems });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getPendingGems = getPendingGems;
const reviewGem = async (req, res) => {
    try {
        const { gemId, status, feedback } = req.body;
        if (![types_1.GemStatus.APPROVED, types_1.GemStatus.REJECTED].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const gem = await Gem_1.default.findById(gemId);
        if (!gem) {
            return res.status(404).json({ message: 'Gem not found' });
        }
        gem.status = status;
        if (feedback) {
            gem.adminFeedback = feedback;
        }
        await gem.save();
        res.json({
            message: `Gem ${status} successfully`,
            gem
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.reviewGem = reviewGem;
const getAllUsers = async (req, res) => {
    try {
        const users = await User_1.default.find().select('-password').sort({ createdAt: -1 });
        res.json({ users });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getAllUsers = getAllUsers;
const getStatistics = async (req, res) => {
    try {
        const totalUsers = await User_1.default.countDocuments();
        const totalGems = await Gem_1.default.countDocuments();
        const pendingGems = await Gem_1.default.countDocuments({ status: types_1.GemStatus.PENDING });
        const approvedGems = await Gem_1.default.countDocuments({ status: types_1.GemStatus.APPROVED });
        res.json({
            statistics: {
                totalUsers,
                totalGems,
                pendingGems,
                approvedGems
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getStatistics = getStatistics;
