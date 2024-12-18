"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const User_1 = require("../models/User");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const response_1 = require("../helper/response");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwtconfig_1 = require("../config/jwtconfig");
const messages_1 = require("../helper/messages");
const authFunction_1 = require("../middleware/authorization/authFunction");
class AuthService {
    constructor() {
        this.login = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                let username = req.body.userName;
                let password = req.body.password;
                let dbUser = yield User_1.UserSchema.findOne({ email: username });
                if (dbUser) {
                    let isValidPass = bcrypt_1.default.compareSync(password, dbUser.password);
                    if (isValidPass) {
                        const token = jsonwebtoken_1.default.sign({
                            email: dbUser.email,
                            id: dbUser._id,
                        }, jwtconfig_1.jwtConfig.secret, { expiresIn: jwtconfig_1.jwtConfig.expiresIn });
                        return (0, response_1.responseStatus)(res, 200, messages_1.msg.user.loginSuccess, { token });
                    }
                    else {
                        console.log('Invalid credentials');
                        return (0, response_1.responseStatus)(res, 400, messages_1.msg.user.invalidCredentials, null);
                    }
                }
                else {
                    console.log('Invalid credentials');
                    return (0, response_1.responseStatus)(res, 400, messages_1.msg.user.invalidCredentials, null);
                }
            }
            catch (error) {
                console.error(error);
                return (0, response_1.responseStatus)(res, 500, 'An error occurred while logging In.', null);
            }
        });
        this.logout = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
                if (!token) {
                    return (0, response_1.responseStatus)(res, 400, messages_1.msg.user.tokenNotFound, null);
                }
                const decoded = jsonwebtoken_1.default.decode(token);
                // console.log(decoded);
                if (!decoded || !decoded.exp) {
                    throw new Error('Invalid token: Missing expiration time.');
                }
                const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
                const ttl = decoded.exp - currentTime; // Remaining time
                (0, authFunction_1.blacklistToken)(token, ttl);
                return (0, response_1.responseStatus)(res, 200, messages_1.msg.user.tokenBlacklisted, token);
            }
            catch (error) {
                console.error(error);
                return (0, response_1.responseStatus)(res, 500, 'An error occurred while logging out.', null);
            }
        });
    }
}
exports.AuthService = AuthService;
