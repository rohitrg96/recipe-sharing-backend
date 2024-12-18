"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = void 0;
const auth_service_1 = require("../services/auth.service");
const response_1 = require("../helper/response");
let authService = new auth_service_1.AuthService();
const login = (req, res) => {
    try {
        return authService.login(req, res);
    }
    catch (error) {
        return (0, response_1.responseStatus)(res, 500, error.message, error);
    }
};
exports.login = login;
const logout = (req, res) => {
    try {
        return authService.logout(req, res);
    }
    catch (error) {
        return (0, response_1.responseStatus)(res, 500, error.message, error);
    }
};
exports.logout = logout;
