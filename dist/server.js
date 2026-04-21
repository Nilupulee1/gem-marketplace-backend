"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const gemRoutes_1 = __importDefault(require("./routes/gemRoutes"));
const auctionRoutes_1 = __importDefault(require("./routes/auctionRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// CORS Configuration
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/gems', gemRoutes_1.default);
app.use('/api/auctions', auctionRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is running',
        cloudinary: {
            configured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY),
            cloudName: process.env.CLOUDINARY_CLOUD_NAME
        }
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('💥 Server Error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        console.log('🔍 Checking environment variables...');
        console.log('📦 Cloudinary Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
        console.log('🔑 Cloudinary API Key:', process.env.CLOUDINARY_API_KEY ? '✓ Set' : '✗ Not set');
        console.log('🔐 Cloudinary API Secret:', process.env.CLOUDINARY_API_SECRET ? '✓ Set' : '✗ Not set');
        await (0, database_1.connectDatabase)();
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 API: http://localhost:${PORT}/api`);
            console.log(`💚 Health: http://localhost:${PORT}/health`);
            console.log(`☁️  Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
