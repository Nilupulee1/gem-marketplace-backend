"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuctionById = exports.getActiveAuctions = exports.placeBid = exports.createAuction = void 0;
const Auction_1 = __importDefault(require("../models/Auction"));
const Gem_1 = __importDefault(require("../models/Gem"));
const types_1 = require("../types");
const createAuction = async (req, res) => {
    try {
        const { gemId, startPrice, minimumBidIncrement, startTime, endTime } = req.body;
        // Verify gem exists and is approved
        const gem = await Gem_1.default.findById(gemId);
        if (!gem) {
            return res.status(404).json({ message: 'Gem not found' });
        }
        if (gem.status !== types_1.GemStatus.APPROVED) {
            return res.status(400).json({ message: 'Only approved gems can be auctioned' });
        }
        if (gem.seller.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'You can only auction your own gems' });
        }
        // Check if gem already has an active auction
        const existingAuction = await Auction_1.default.findOne({
            gem: gemId,
            status: types_1.AuctionStatus.ACTIVE
        });
        if (existingAuction) {
            return res.status(400).json({ message: 'Gem already has an active auction' });
        }
        const auction = new Auction_1.default({
            gem: gemId,
            seller: req.user.userId,
            startPrice,
            currentBid: startPrice,
            minimumBidIncrement,
            startTime,
            endTime,
            status: types_1.AuctionStatus.ACTIVE
        });
        await auction.save();
        res.status(201).json({
            message: 'Auction created successfully',
            auction
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.createAuction = createAuction;
const placeBid = async (req, res) => {
    try {
        const { auctionId, amount } = req.body;
        const auction = await Auction_1.default.findById(auctionId);
        if (!auction) {
            return res.status(404).json({ message: 'Auction not found' });
        }
        if (auction.status !== types_1.AuctionStatus.ACTIVE) {
            return res.status(400).json({ message: 'Auction is not active' });
        }
        if (new Date() > auction.endTime) {
            return res.status(400).json({ message: 'Auction has ended' });
        }
        if (amount < auction.currentBid + auction.minimumBidIncrement) {
            return res.status(400).json({
                message: `Bid must be at least ${auction.currentBid + auction.minimumBidIncrement}`
            });
        }
        auction.bids.push({
            bidder: req.user.userId,
            amount,
            timestamp: new Date()
        });
        auction.currentBid = amount;
        await auction.save();
        res.json({
            message: 'Bid placed successfully',
            auction
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.placeBid = placeBid;
const getActiveAuctions = async (req, res) => {
    try {
        const auctions = await Auction_1.default.find({ status: types_1.AuctionStatus.ACTIVE })
            .populate('gem')
            .populate('seller', 'name email')
            .sort({ endTime: 1 });
        res.json({ auctions });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getActiveAuctions = getActiveAuctions;
const getAuctionById = async (req, res) => {
    try {
        const auction = await Auction_1.default.findById(req.params.id)
            .populate('gem')
            .populate('seller', 'name email')
            .populate('bids.bidder', 'name email');
        if (!auction) {
            return res.status(404).json({ message: 'Auction not found' });
        }
        res.json({ auction });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getAuctionById = getAuctionById;
