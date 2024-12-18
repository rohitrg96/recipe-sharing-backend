"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdateUser = exports.validateAddUser = void 0;
const joi_1 = __importDefault(require("joi"));
const validate_1 = require("../middleware/validation/validate");
exports.validateAddUser = (0, validate_1.validationMiddleware)(joi_1.default.object({
    firstName: joi_1.default.string().required(),
    lastName: joi_1.default.string().required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required(),
}));
exports.validateUpdateUser = (0, validate_1.validationMiddleware)(joi_1.default.object({
    firstName: joi_1.default.string().optional(),
    lastName: joi_1.default.string().optional(),
    email: joi_1.default.string().email().optional(),
    password: joi_1.default.string().when('email', {
        is: joi_1.default.exist(),
        then: joi_1.default.required(), // `Password` is required when `email` exists
        otherwise: joi_1.default.optional(), // `Password` is optional when `email` is not provided
    }),
    newPassword: joi_1.default.string()
        .when('password', {
        is: joi_1.default.exist(),
        then: joi_1.default.required(), // `newPassword` is required when `password` exists
        otherwise: joi_1.default.optional(), // `newPassword` is optional when `password` is not provided
    })
        .when('email', {
        is: joi_1.default.exist(),
        then: joi_1.default.required(), // `newPassword` is required when `email` exists
        otherwise: joi_1.default.optional(), // `newPassword` is optional when `email` is not provided
    }),
}));
