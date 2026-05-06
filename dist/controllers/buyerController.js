"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWonAuctions = exports.getMyActiveBids = exports.getMyBidHistory = exports.getBuyerDashboard = void 0;
const Auction_1 = __importDefault(require("../models/Auction"));
const types_1 = require("../types");
const isAuctionRunning = (startTime, endTime, status) => {
    const now = new Date();
    return status === types_1.AuctionStatus.ACTIVE && now >= startTime && now <= endTime;
};
const getBuyerDashboard = async (req, res) => {
    try {
        const userId = req.user.userId;
        const [myBidAuctions, wonAuctions] = await Promise.all([
            Auction_1.default.find({ 'bids.bidder': userId })
                .populate('gem')
                .populate('seller', 'name email')
                .sort({ updatedAt: -1 }),
            Auction_1.default.find({ winner: userId, status: types_1.AuctionStatus.ENDED })
                .populate('gem')
                .populate('seller', 'name email')
                .sort({ endTime: -1 })
        ]);
        let totalBidsPlaced = 0;
        const recentBidEntries = [];
        myBidAuctions.forEach((auction) => {
            const myBids = auction.bids.filter((bid) => bid.bidder.toString() === userId);
            totalBidsPlaced += myBids.length;
            const latestBid = auction.bids[auction.bids.length - 1];
            const isWinning = !!latestBid && latestBid.bidder.toString() === userId;
            myBids.forEach((bid) => {
                recentBidEntries.push({
                    auctionId: auction._id.toString(),
                    gem: auction.gem,
                    amount: bid.amount,
                    timestamp: bid.timestamp,
                    currentBid: auction.currentBid,
                    isWinning,
                    endTime: auction.endTime
                });
            });
        });
        recentBidEntries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        const activeBidsCount = myBidAuctions.filter((auction) => isAuctionRunning(auction.startTime, auction.endTime, auction.status)).length;
        res.json({
            stats: {
                auctionsParticipated: myBidAuctions.length,
                activeBids: activeBidsCount,
                wonAuctions: wonAuctions.length,
                totalBidsPlaced
            },
            recentBids: recentBidEntries.slice(0, 5),
            recentWins: wonAuctions.slice(0, 5)
        });
    }
    catch (error) {
        console.error('Error loading buyer dashboard:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};
exports.getBuyerDashboard = getBuyerDashboard;
const getMyBidHistory = async (req, res) => {
    try {
        const userId = req.user.userId;
        const auctions = await Auction_1.default.find({ 'bids.bidder': userId })
            .populate('gem')
            .populate('seller', 'name email')
            .sort({ updatedAt: -1 });
        const bidHistory = [];
        auctions.forEach((auction) => {
            const latestBid = auction.bids[auction.bids.length - 1];
            const isWinning = !!latestBid && latestBid.bidder.toString() === userId;
            auction.bids
                .filter((bid) => bid.bidder.toString() === userId)
                .forEach((bid) => {
                bidHistory.push({
                    auctionId: auction._id.toString(),
                    gem: auction.gem,
                    seller: auction.seller,
                    amount: bid.amount,
                    timestamp: bid.timestamp,
                    currentBid: auction.currentBid,
                    minimumBidIncrement: auction.minimumBidIncrement,
                    status: auction.status,
                    endTime: auction.endTime,
                    isWinning
                });
            });
        });
        bidHistory.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        res.json({ bidHistory });
    }
    catch (error) {
        console.error('Error loading buyer bid history:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};
exports.getMyBidHistory = getMyBidHistory;
const getMyActiveBids = async (req, res) => {
    try {
        const userId = req.user.userId;
        const auctions = await Auction_1.default.find({
            'bids.bidder': userId,
            status: types_1.AuctionStatus.ACTIVE
        })
            .populate('gem')
            .populate('seller', 'name email')
            .sort({ endTime: 1 });
        const activeBids = auctions
            .filter((auction) => isAuctionRunning(auction.startTime, auction.endTime, auction.status))
            .map((auction) => {
            const myBids = auction.bids.filter((bid) => bid.bidder.toString() === userId);
            const myHighestBid = myBids.reduce((max, bid) => Math.max(max, bid.amount), 0);
            const latestBid = auction.bids[auction.bids.length - 1];
            const isWinning = !!latestBid && latestBid.bidder.toString() === userId;
            return {
                auction,
                myHighestBid,
                bidsPlacedByMe: myBids.length,
                isWinning,
                remainingTimeMs: Math.max(auction.endTime.getTime() - Date.now(), 0)
            };
        });
        res.json({ activeBids });
    }
    catch (error) {
        console.error('Error loading buyer active bids:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};
exports.getMyActiveBids = getMyActiveBids;
const getWonAuctions = async (req, res) => {
    try {
        const userId = req.user.userId;
        const wonAuctions = await Auction_1.default.find({
            winner: userId,
            status: types_1.AuctionStatus.ENDED
        })
            .populate('gem')
            .populate('seller', 'name email')
            .sort({ endTime: -1 });
        const totalWonValue = wonAuctions.reduce((sum, auction) => sum + auction.currentBid, 0);
        res.json({
            stats: {
                totalWonAuctions: wonAuctions.length,
                totalWonValue
            },
            wonAuctions
        });
    }
    catch (error) {
        console.error('Error loading won auctions:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};
exports.getWonAuctions = getWonAuctions;
