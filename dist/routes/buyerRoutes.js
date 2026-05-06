"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const roleAuth_1 = require("../middleware/roleAuth");
const types_1 = require("../types");
const buyerController_1 = require("../controllers/buyerController");
const router = express_1.default.Router();
router.use(auth_1.authenticate, (0, roleAuth_1.requireRole)(types_1.UserRole.BUYER));
router.get('/dashboard', buyerController_1.getBuyerDashboard);
router.get('/bid-history', buyerController_1.getMyBidHistory);
router.get('/active-bids', buyerController_1.getMyActiveBids);
router.get('/won-auctions', buyerController_1.getWonAuctions);
exports.default = router;
