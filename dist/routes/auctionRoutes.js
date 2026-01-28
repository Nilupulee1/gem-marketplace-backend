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
router.post('/', auth_1.authenticate, (0, roleAuth_1.requireRole)(types_1.UserRole.SELLER), auctionController_1.createAuction);
router.post('/bid', auth_1.authenticate, (0, roleAuth_1.requireRole)(types_1.UserRole.BUYER), auctionController_1.placeBid);
router.get('/active', auth_1.authenticate, auctionController_1.getActiveAuctions);
router.get('/:id', auth_1.authenticate, auctionController_1.getAuctionById);
exports.default = router;
