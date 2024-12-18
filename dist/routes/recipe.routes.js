"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const recipesController = __importStar(require("../controllers/recipe.controller"));
const recipe_validator_1 = require("../validator/recipe.validator");
const authFunction_1 = require("../middleware/authorization/authFunction");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)();
let recipeRouter = express_1.default.Router();
recipeRouter.post('/', recipe_validator_1.validateAddRecipe, authFunction_1.validateToken, recipesController.AddRecipe);
recipeRouter.put('/:recipeId', recipe_validator_1.validateUpdateRecipe, authFunction_1.validateToken, recipesController.UpdateRecipe);
recipeRouter.get('/:recipeId', authFunction_1.validateToken, recipesController.GetRecipe);
recipeRouter.get('/', recipesController.GetAllRecipes);
recipeRouter.delete('/:recipeId', authFunction_1.validateToken, recipesController.DeleteRecipe);
recipeRouter.put('/rating/:recipeId', recipe_validator_1.validateAddRating, authFunction_1.validateToken, recipesController.AddRating);
recipeRouter.put('/comment/:recipeId', recipe_validator_1.validateAddComment, authFunction_1.validateToken, recipesController.AddComment);
recipeRouter.post('/upload-image', authFunction_1.validateToken, upload.single('image'), recipesController.AddImage);
recipeRouter.get('/user-feedback/:recipeId', authFunction_1.validateToken, recipesController.CheckUserCommentAndRating);
exports.default = recipeRouter;
