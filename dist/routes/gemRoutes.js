"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const roleAuth_1 = require("../middleware/roleAuth");
const upload_1 = require("../middleware/upload");
const types_1 = require("../types");
const gemController_1 = require("../controllers/gemController");
const router = express_1.default.Router();
// Create gem with file uploads
router.post('/', auth_1.authenticate, (0, roleAuth_1.requireRole)(types_1.UserRole.SELLER), upload_1.upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'certificate', maxCount: 1 }
]), gemController_1.createGem);
// Get seller's own gems
router.get('/my-gems', auth_1.authenticate, (0, roleAuth_1.requireRole)(types_1.UserRole.SELLER), gemController_1.getMyGems);
// Get all approved gems (accessible by all authenticated users)
router.get('/approved', auth_1.authenticate, gemController_1.getApprovedGems);
// Get specific gem by ID
router.get('/:id', auth_1.authenticate, gemController_1.getGemById);
// Update gem
router.patch('/:id', auth_1.authenticate, (0, roleAuth_1.requireRole)(types_1.UserRole.SELLER), gemController_1.updateGem);
// Delete gem
router.delete('/:id', auth_1.authenticate, (0, roleAuth_1.requireRole)(types_1.UserRole.SELLER), gemController_1.deleteGem);
exports.default = router;
