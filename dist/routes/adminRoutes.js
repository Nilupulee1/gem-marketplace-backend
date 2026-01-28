"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const roleAuth_1 = require("../middleware/roleAuth");
const types_1 = require("../types");
const adminController_1 = require("../controllers/adminController");
const router = express_1.default.Router();
router.use(auth_1.authenticate, (0, roleAuth_1.requireRole)(types_1.UserRole.ADMIN));
router.get('/gems/pending', adminController_1.getPendingGems);
router.post('/gems/review', adminController_1.reviewGem);
router.get('/users', adminController_1.getAllUsers);
router.get('/statistics', adminController_1.getStatistics);
exports.default = router;
