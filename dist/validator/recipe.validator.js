"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAddComment = exports.validateAddRating = exports.validateUpdateRecipe = exports.validateAddRecipe = void 0;
const joi_1 = __importDefault(require("joi"));
const validate_1 = require("../middleware/validation/validate");
exports.validateAddRecipe = (0, validate_1.validationMiddleware)(joi_1.default.object({
    title: joi_1.default.string().required(),
    ingredients: joi_1.default.array().items(joi_1.default.string()).required(),
    steps: joi_1.default.array().items(joi_1.default.string()).required(),
    image: joi_1.default.string().optional().allow(null),
    preparationTime: joi_1.default.number().optional().allow(null),
}));
exports.validateUpdateRecipe = (0, validate_1.validationMiddleware)(joi_1.default.object({
    recipeId: joi_1.default.string().required(),
    title: joi_1.default.string().optional(),
    ingredients: joi_1.default.array().items(joi_1.default.string()).optional(),
    steps: joi_1.default.array().items(joi_1.default.string()).optional(),
    image: joi_1.default.string().optional().allow(null),
    preparationTime: joi_1.default.number().optional().allow(null),
}));
exports.validateAddRating = (0, validate_1.validationMiddleware)(joi_1.default.object({
    recipeId: joi_1.default.string().required(),
    rating: joi_1.default.number().integer().required().min(1).max(5),
}));
exports.validateAddComment = (0, validate_1.validationMiddleware)(joi_1.default.object({
    recipeId: joi_1.default.string().required(),
    comment: joi_1.default.string().required(),
}));
