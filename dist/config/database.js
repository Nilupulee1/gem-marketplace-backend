"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDatabase = async () => {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        console.error('❌ MONGODB_URI is not set in environment variables');
        process.exit(1);
    }
    try {
        await mongoose_1.default.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000,
        });
        console.log('✅ MongoDB connected successfully');
        console.log(`📚 Database: ${mongoose_1.default.connection.name}`);
    }
    catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};
exports.connectDatabase = connectDatabase;
