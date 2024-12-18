"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteUser = exports.GetUser = exports.GetAllUsers = exports.UpdateUser = exports.AddUser = void 0;
const user_service_1 = require("../services/user.service");
const response_1 = require("../helper/response");
let userService = new user_service_1.UserService();
const AddUser = (req, res) => {
    try {
        return userService.addUser(req, res);
    }
    catch (error) {
        return (0, response_1.responseStatus)(res, 500, error.message, error);
    }
};
exports.AddUser = AddUser;
const UpdateUser = (req, res) => {
    try {
        return userService.updateUser(req, res);
    }
    catch (error) {
        return (0, response_1.responseStatus)(res, 500, error.message, error);
    }
};
exports.UpdateUser = UpdateUser;
const GetAllUsers = (req, res) => {
    try {
        return userService.getAllUsers(req, res);
    }
    catch (error) {
        return (0, response_1.responseStatus)(res, 500, error.message, error);
    }
};
exports.GetAllUsers = GetAllUsers;
const GetUser = (req, res) => {
    try {
        return userService.getUser(req, res);
    }
    catch (error) {
        return (0, response_1.responseStatus)(res, 500, error.message, error);
    }
};
exports.GetUser = GetUser;
const DeleteUser = (req, res) => {
    try {
        return userService.deleteUser(req, res);
    }
    catch (error) {
        return (0, response_1.responseStatus)(res, 500, error.message, error);
    }
};
exports.DeleteUser = DeleteUser;
