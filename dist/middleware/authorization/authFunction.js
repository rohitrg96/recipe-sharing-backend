"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blacklistToken = exports.validateToken = void 0;
const jwtconfig_1 = require("../../config/jwtconfig");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cache_1 = __importDefault(require("../../config/cache"));
const validateToken = (req, res, next) => {
    if (!req.headers.authorization) {
        res.status(403).json({
            message: 'Access Token Required',
        });
        return;
    }
    const token = req.headers.authorization.split(' ')[1];
    if (cache_1.default.get(token)) {
        res.status(401).json({ message: 'Access Denied: Token is blacklisted' });
        return;
    }
    jsonwebtoken_1.default.verify(token, jwtconfig_1.jwtConfig.secret, (err, decoded) => {
        if (err) {
            res.status(401).json({
                status: 'error',
                message: 'unauthorized',
            });
            return;
        }
        else {
            req.user = decoded;
            // console.log(req.user);
            next();
        }
    });
};
exports.validateToken = validateToken;
const blacklistToken = (token, ttl) => {
    const defaultTTL = 3600; // 1 hour
    cache_1.default.set(token, true, ttl || defaultTTL);
};
exports.blacklistToken = blacklistToken;
