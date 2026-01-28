"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionStatus = exports.GemStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["SELLER"] = "seller";
    UserRole["BUYER"] = "buyer";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
var GemStatus;
(function (GemStatus) {
    GemStatus["PENDING"] = "pending";
    GemStatus["APPROVED"] = "approved";
    GemStatus["REJECTED"] = "rejected";
})(GemStatus || (exports.GemStatus = GemStatus = {}));
var AuctionStatus;
(function (AuctionStatus) {
    AuctionStatus["ACTIVE"] = "active";
    AuctionStatus["ENDED"] = "ended";
    AuctionStatus["CANCELLED"] = "cancelled";
})(AuctionStatus || (exports.AuctionStatus = AuctionStatus = {}));
