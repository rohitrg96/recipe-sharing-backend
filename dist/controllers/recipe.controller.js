"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddImage = exports.CheckUserCommentAndRating = exports.AddComment = exports.AddRating = exports.DeleteRecipe = exports.GetRecipe = exports.GetAllRecipes = exports.UpdateRecipe = exports.AddRecipe = void 0;
const recipe_service_1 = require("../services/recipe.service");
const response_1 = require("../helper/response");
let recipeService = new recipe_service_1.RecipeService();
const AddRecipe = (req, res) => {
    try {
        return recipeService.addRecipe(req, res);
    }
    catch (error) {
        return (0, response_1.responseStatus)(res, 500, error.message, error);
    }
};
exports.AddRecipe = AddRecipe;
const UpdateRecipe = (req, res) => {
    try {
        return recipeService.updateRecipe(req, res);
    }
    catch (error) {
        return (0, response_1.responseStatus)(res, 500, error.message, error);
    }
};
exports.UpdateRecipe = UpdateRecipe;
const GetAllRecipes = (req, res) => {
    try {
        return recipeService.getAllRecipes(req, res);
    }
    catch (error) {
        return (0, response_1.responseStatus)(res, 500, error.message, error);
    }
};
exports.GetAllRecipes = GetAllRecipes;
const GetRecipe = (req, res) => {
    try {
        return recipeService.getRecipe(req, res);
    }
    catch (error) {
        return (0, response_1.responseStatus)(res, 500, error.message, error);
    }
};
exports.GetRecipe = GetRecipe;
const DeleteRecipe = (req, res) => {
    try {
        return recipeService.deleteRecipe(req, res);
    }
    catch (error) {
        return (0, response_1.responseStatus)(res, 500, error.message, error);
    }
};
exports.DeleteRecipe = DeleteRecipe;
const AddRating = (req, res) => {
    try {
        return recipeService.AddRating(req, res);
    }
    catch (error) {
        return (0, response_1.responseStatus)(res, 500, error.message, error);
    }
};
exports.AddRating = AddRating;
const AddComment = (req, res) => {
    try {
        return recipeService.AddComment(req, res);
    }
    catch (error) {
        return (0, response_1.responseStatus)(res, 500, error.message, error);
    }
};
exports.AddComment = AddComment;
const CheckUserCommentAndRating = (req, res) => {
    try {
        return recipeService.CheckUserCommentAndRating(req, res);
    }
    catch (error) {
        return (0, response_1.responseStatus)(res, 500, error.message, error);
    }
};
exports.CheckUserCommentAndRating = CheckUserCommentAndRating;
const AddImage = (req, res) => {
    try {
        return recipeService.uploadImage(req, res);
    }
    catch (error) {
        return (0, response_1.responseStatus)(res, 500, error.message, error);
    }
};
exports.AddImage = AddImage;
