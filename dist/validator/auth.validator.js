"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatelogin = void 0;
const joi_1 = __importDefault(require("joi"));
const validate_1 = require("../middleware/validation/validate");
exports.validatelogin = (0, validate_1.validationMiddleware)(joi_1.default.object({
    userName: joi_1.default.string().email().required(),
    password: joi_1.default.string().required(),
}));
