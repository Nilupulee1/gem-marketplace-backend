"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const roleAuth_1 = require("../middleware/roleAuth");
const types_1 = require("../types");
const auctionController_1 = require("../controllers/auctionController");
const router = express_1.default.Router();
// Create auction (seller only)
router.post('/', auth_1.authenticate, (0, roleAuth_1.requireRole)(types_1.UserRole.SELLER), auctionController_1.createAuction);
// Place bid (buyer only)
router.post('/bid', auth_1.authenticate, (0, roleAuth_1.requireRole)(types_1.UserRole.BUYER), auctionController_1.placeBid);
// Get all active auctions (all authenticated users)
router.get('/active', auth_1.authenticate, auctionController_1.getActiveAuctions);
// Get my auctions (seller only)
router.get('/my-auctions', auth_1.authenticate, (0, roleAuth_1.requireRole)(types_1.UserRole.SELLER), auctionController_1.getMyAuctions);
// Get specific auction by ID
router.get('/:id', auth_1.authenticate, auctionController_1.getAuctionById);
// Delete auction (seller only)
router.delete('/:id', auth_1.authenticate, (0, roleAuth_1.requireRole)(types_1.UserRole.SELLER), auctionController_1.deleteAuction);
// Update auction status (seller or admin)
router.patch('/:id/status', auth_1.authenticate, auctionController_1.updateAuctionStatus);
exports.default = router;
