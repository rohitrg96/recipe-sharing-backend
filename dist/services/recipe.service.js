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
exports.RecipeService = void 0;
const Recipe_1 = require("../models/Recipe");
const response_1 = require("../helper/response");
const messages_1 = require("../helper/messages");
const User_1 = require("../models/User");
const cloudinary_1 = require("cloudinary");
const multer_1 = __importDefault(require("../config/multer"));
class RecipeService {
    constructor() {
        this.addRecipe = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                let recipe = req.body;
                let userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                let userExist = yield User_1.UserSchema.findOne({ _id: userId });
                if (!userExist) {
                    return (0, response_1.responseStatus)(res, 400, messages_1.msg.user.notFound, null);
                }
                let dbRecipe = yield Recipe_1.RecipeSchema.create({
                    title: recipe.title,
                    ingredients: recipe.ingredients,
                    image: recipe.image || null,
                    steps: recipe.steps,
                    preparationTime: recipe.preparationTime,
                    user: userId,
                });
                dbRecipe = yield dbRecipe.populate('user', 'firstName lastName email');
                if (dbRecipe) {
                    return (0, response_1.responseStatus)(res, 200, messages_1.msg.recipe.added, dbRecipe);
                }
                else {
                    return (0, response_1.responseStatus)(res, 400, 'error creating recipe', null);
                }
            }
            catch (error) {
                console.error(error);
                return (0, response_1.responseStatus)(res, 500, 'An error occurred while adding recipe.', null);
            }
        });
        this.updateRecipe = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                let recipeId = req.params.recipeId;
                let recipe = req.body;
                let userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                let recipeExist = yield Recipe_1.RecipeSchema.findOne({
                    _id: recipeId,
                    user: userId,
                });
                if (!recipeExist) {
                    return (0, response_1.responseStatus)(res, 400, messages_1.msg.recipe.notFound, null);
                }
                let updatedRecipe = yield Recipe_1.RecipeSchema.findByIdAndUpdate(recipeId, {
                    title: recipe.title,
                    ingredients: recipe.ingredients,
                    image: recipe.image || null,
                    steps: recipe.steps,
                    preparationTime: recipe.preparationTime,
                    user: userId,
                }, { new: true }).populate('user', 'firstName lastName email');
                if (updatedRecipe) {
                    return (0, response_1.responseStatus)(res, 200, messages_1.msg.recipe.updated, updatedRecipe);
                }
                else {
                    return (0, response_1.responseStatus)(res, 400, 'error updating recipe', null);
                }
            }
            catch (error) {
                console.error(error);
                return (0, response_1.responseStatus)(res, 500, 'An error occurred while updating recipe.', null);
            }
        });
        this.getAllRecipes = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { ingredients, title, minRating, maxPreparationTime, page = 1, limit = 10000000, } = req.query;
                const query = {};
                //search recipes based on ingrediants
                if (ingredients && ingredients.length) {
                    const ingredientsArr = ingredients.split(',').map((ingredient) => ingredient.trim());
                    query.ingredients = {
                        $in: ingredientsArr.map((ingredient) => new RegExp(ingredient, 'i')), // Partial case-insensitive match
                    };
                }
                // search by title
                if (title !== undefined && title.trim() !== '') {
                    query.title = new RegExp(title, 'i');
                }
                // Filter by maximum preparation time
                if (maxPreparationTime !== undefined && maxPreparationTime.trim() !== '') {
                    query.preparationTime = { $lte: +maxPreparationTime };
                }
                const pageNumber = parseInt(page, 10);
                const limitNumber = parseInt(limit, 10);
                let recipes = yield Recipe_1.RecipeSchema.find(query)
                    .populate('user', 'firstName lastName email')
                    .populate('stars.user', 'firstName lastName email')
                    .lean();
                let updatedRecipes = recipes.map((recipe) => {
                    const starsCount = recipe.stars ? recipe.stars.length : 0;
                    const averageStars = starsCount > 0 && recipe.stars ? recipe.stars.reduce((sum, star) => sum + star.rating, 0) / starsCount : 0;
                    return Object.assign(Object.assign({}, recipe), { starsCount,
                        averageStars });
                });
                // Filter by minimum rating
                if (minRating) {
                    updatedRecipes = updatedRecipes.filter((recipe) => recipe.averageStars >= +minRating);
                }
                // const totalRecipes = await RecipeSchema.countDocuments(query);
                const totalRecipes = updatedRecipes.length;
                const paginatedRecipes = updatedRecipes.slice((pageNumber - 1) * limitNumber, pageNumber * limitNumber);
                const finalData = {
                    data: paginatedRecipes,
                    pagination: {
                        total: totalRecipes,
                        page: pageNumber,
                        limit: limitNumber,
                        totalPages: Math.ceil(totalRecipes / limitNumber),
                    },
                };
                return (0, response_1.responseStatus)(res, 200, messages_1.msg.recipe.fetched, finalData);
            }
            catch (error) {
                console.error(error);
                return (0, response_1.responseStatus)(res, 500, 'An error occurred while fetching recipes.', null);
            }
        });
        this.getRecipe = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                let recipeId = req.params.recipeId;
                if (!recipeId) {
                    return (0, response_1.responseStatus)(res, 400, messages_1.msg.recipe.notFound, null);
                }
                let recipeExist = yield Recipe_1.RecipeSchema.findOne({ _id: recipeId })
                    .populate('user', 'firstName lastName email')
                    .populate('stars.user', 'firstName lastName email')
                    .populate('comments.user', 'firstName lastName email');
                if (recipeExist) {
                    return (0, response_1.responseStatus)(res, 200, messages_1.msg.recipe.fetched, recipeExist);
                }
                else {
                    return (0, response_1.responseStatus)(res, 400, 'error fetching recipe Details', null);
                }
            }
            catch (error) {
                console.error(error);
                return (0, response_1.responseStatus)(res, 500, 'An error occurred while fetching recipe.', null);
            }
        });
        this.deleteRecipe = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                let recipeId = req.params.recipeId;
                let userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                let deleteRecipe = yield Recipe_1.RecipeSchema.findByIdAndDelete({
                    _id: recipeId,
                    user: userId,
                }).populate('user', 'firstName lastName email');
                if (deleteRecipe) {
                    return (0, response_1.responseStatus)(res, 200, messages_1.msg.recipe.deleted, deleteRecipe);
                }
                else {
                    return (0, response_1.responseStatus)(res, 400, 'error deleting recipe', null);
                }
            }
            catch (error) {
                console.error(error);
                return (0, response_1.responseStatus)(res, 500, 'An error occurred while deleting recipe.', null);
            }
        });
        //logged in user can rate any recipe
        this.AddRating = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                let recipeId = req.params.recipeId;
                let userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                let userRating = req.body.rating;
                let updatedRecipe = yield Recipe_1.RecipeSchema.findById(recipeId);
                if (!updatedRecipe) {
                    return (0, response_1.responseStatus)(res, 400, messages_1.msg.recipe.notFound, null);
                }
                //// Check if the user has already rated this recipe
                const existingRating = (_b = updatedRecipe.stars) === null || _b === void 0 ? void 0 : _b.find((star) => star.user.toString() === userId);
                if (existingRating) {
                    // Update the existing rating
                    existingRating.rating = userRating;
                }
                else {
                    // Add a new rating
                    (_c = updatedRecipe.stars) === null || _c === void 0 ? void 0 : _c.push({ user: userId, rating: userRating });
                }
                // Save the updated recipe
                const ratingAdded = yield updatedRecipe.save();
                if (ratingAdded) {
                    return (0, response_1.responseStatus)(res, 200, messages_1.msg.recipe.updated, updatedRecipe);
                }
                else {
                    return (0, response_1.responseStatus)(res, 400, 'error updating recipe', null);
                }
            }
            catch (error) {
                console.error(error);
                return (0, response_1.responseStatus)(res, 500, 'An error occurred while updating recipe.', null);
            }
        });
        //logged in user can comment on any recipe
        this.AddComment = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                let recipeId = req.params.recipeId;
                let userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                let userComment = req.body.comment;
                let updatedRecipe = yield Recipe_1.RecipeSchema.findById(recipeId);
                if (!updatedRecipe) {
                    return (0, response_1.responseStatus)(res, 400, messages_1.msg.recipe.notFound, null);
                }
                //// Check if the user has already commented this recipe
                const existingComment = (_b = updatedRecipe.comments) === null || _b === void 0 ? void 0 : _b.find((comment) => comment.user.toString() === userId);
                if (existingComment) {
                    // Update the existing comment
                    existingComment.comment = userComment;
                }
                else {
                    // Add a new comment
                    (_c = updatedRecipe.comments) === null || _c === void 0 ? void 0 : _c.push({ user: userId, comment: userComment });
                }
                // Save the updated recipe
                const commnetAdded = yield updatedRecipe.save();
                if (commnetAdded) {
                    return (0, response_1.responseStatus)(res, 200, messages_1.msg.recipe.updated, updatedRecipe);
                }
                else {
                    return (0, response_1.responseStatus)(res, 400, 'error updating recipe', null);
                }
            }
            catch (error) {
                console.error(error);
                return (0, response_1.responseStatus)(res, 500, 'An error occurred while updating recipe.', null);
            }
        });
        this.CheckUserCommentAndRating = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                let recipeId = req.params.recipeId;
                let userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                let recipeDetails = yield Recipe_1.RecipeSchema.findOne({ _id: recipeId });
                const checkIfUserhasCommented = (_b = recipeDetails === null || recipeDetails === void 0 ? void 0 : recipeDetails.comments) === null || _b === void 0 ? void 0 : _b.find((c) => {
                    return c.user._id == userId;
                });
                const checkIfUserhasRated = (_c = recipeDetails === null || recipeDetails === void 0 ? void 0 : recipeDetails.stars) === null || _c === void 0 ? void 0 : _c.find((s) => {
                    return s.user._id == userId;
                });
                const data = {
                    userCommented: checkIfUserhasCommented ? true : false,
                    userRated: checkIfUserhasRated ? true : false,
                    checkIfUserhasCommented,
                    checkIfUserhasRated,
                };
                return (0, response_1.responseStatus)(res, 200, 'User feedback on recipe', data);
            }
            catch (error) {
                console.error(error);
                return (0, response_1.responseStatus)(res, 500, 'An error occurred while updating recipe.', null);
            }
        });
        this.uploadImage = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.file) {
                    return (0, response_1.responseStatus)(res, 400, messages_1.msg.recipe.imageNotFound, null);
                }
                (0, multer_1.default)();
                cloudinary_1.v2.uploader
                    .upload_stream({ resource_type: 'auto', folder: 'tasty-tales-images' }, // Automatically detect the file type (image, video, etc.)
                (error, result) => {
                    if (error) {
                        console.log(error);
                        return (0, response_1.responseStatus)(res, 400, messages_1.msg.recipe.imageNotFound, null);
                    }
                    return (0, response_1.responseStatus)(res, 200, messages_1.msg.recipe.imageAdded, { url: result === null || result === void 0 ? void 0 : result.secure_url });
                })
                    .end(req.file.buffer); // Send the file buffer to Cloudinary
            }
            catch (error) {
                console.error(error, 1);
                return (0, response_1.responseStatus)(res, 500, 'An error occurred while updating recipe.', null);
            }
        });
    }
}
exports.RecipeService = RecipeService;
