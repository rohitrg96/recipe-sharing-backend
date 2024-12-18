"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const apiRouter = (0, express_1.Router)();
const user_routes_1 = __importDefault(require("../routes/user.routes"));
const auth_routes_1 = __importDefault(require("./auth.routes"));
const recipe_routes_1 = __importDefault(require("./recipe.routes"));
apiRouter.use('/users', user_routes_1.default);
apiRouter.use('/auth', auth_routes_1.default);
apiRouter.use('/recipes', recipe_routes_1.default);
exports.default = apiRouter;
