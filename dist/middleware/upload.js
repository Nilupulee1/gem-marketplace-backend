"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.default,
    params: async (req, file) => {
        const isImage = file.mimetype.startsWith('image/');
        const isPdf = file.mimetype === 'application/pdf';
        const params = {
            folder: 'gem_marketplace',
            resource_type: isPdf ? 'raw' : 'image',
            allowed_formats: isPdf ? ['pdf'] : ['jpg', 'jpeg', 'png'],
        };
        // Only add transformation for images
        if (isImage) {
            params.transformation = [{ width: 1000, height: 1000, crop: 'limit' }];
        }
        return params;
    },
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') ||
        file.mimetype === 'application/pdf') {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter,
});
