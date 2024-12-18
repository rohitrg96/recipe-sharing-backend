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
exports.UserService = void 0;
const User_1 = require("../models/User");
const response_1 = require("../helper/response");
const messages_1 = require("../helper/messages");
const bcrypt_1 = __importDefault(require("bcrypt"));
class UserService {
    constructor() {
        this.addUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                let user = req.body;
                let emailExist = yield User_1.UserSchema.findOne({ email: user.email });
                if (emailExist) {
                    return (0, response_1.responseStatus)(res, 400, messages_1.msg.user.emailExist, null);
                }
                const saltRounds = 10;
                user.password = yield bcrypt_1.default.hash(user.password, saltRounds);
                let dbUser = yield User_1.UserSchema.create(user);
                const limitedFieldsUser = yield User_1.UserSchema.findById(dbUser._id).select('firstName lastName email');
                if (dbUser) {
                    return (0, response_1.responseStatus)(res, 200, messages_1.msg.user.added, limitedFieldsUser);
                }
                else {
                    return (0, response_1.responseStatus)(res, 400, 'error creating user', dbUser);
                }
            }
            catch (error) {
                console.error(error);
                return (0, response_1.responseStatus)(res, 500, 'An error occurred while adding user.', null);
            }
        });
        this.updateUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                let user = req.body;
                let userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                let userExist = yield User_1.UserSchema.findOne({ _id: userId });
                if (!userExist) {
                    return (0, response_1.responseStatus)(res, 400, messages_1.msg.user.notFound, null);
                }
                if ((user.email || user.newPassword) && user.password) {
                    const isMatch = yield bcrypt_1.default.compare(user.password, userExist.password);
                    if (!isMatch) {
                        return (0, response_1.responseStatus)(res, 400, messages_1.msg.user.invalidCredentials, null);
                    }
                }
                if (user.email) {
                    const emailexist = yield User_1.UserSchema.findOne({
                        email: user.email,
                    });
                    if (emailexist && emailexist.id !== userId) {
                        return (0, response_1.responseStatus)(res, 400, messages_1.msg.user.emailExist, null);
                    }
                }
                const saltRounds = 10;
                user.newPassword = yield bcrypt_1.default.hash(user.newPassword, saltRounds);
                let updatedUser = yield User_1.UserSchema.findByIdAndUpdate(userId, {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    password: user.newPassword,
                }, { new: true });
                if (updatedUser) {
                    return (0, response_1.responseStatus)(res, 200, messages_1.msg.user.updated, updatedUser);
                }
                else {
                    return (0, response_1.responseStatus)(res, 400, 'error updating user', null);
                }
            }
            catch (error) {
                console.error(error);
                return (0, response_1.responseStatus)(res, 500, 'An error occurred while updating user.', null);
            }
        });
        this.getAllUsers = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { firstName, lastName, email, page = 1, limit = 10 } = req.query;
                const query = {};
                // search by firstName
                if (firstName !== undefined && firstName.trim() !== '') {
                    query.firstName = new RegExp(firstName, 'i');
                }
                // search by LastName
                if (lastName !== undefined && lastName.trim() !== '') {
                    query.lastName = new RegExp(lastName, 'i');
                }
                // search by email
                if (email !== undefined && email.trim() !== '') {
                    query.email = new RegExp(email, 'i');
                }
                const pageNumber = parseInt(page, 10);
                const limitNumber = parseInt(limit, 10);
                let users = yield User_1.UserSchema.find(query)
                    .skip((pageNumber - 1) * limitNumber)
                    .limit(limitNumber);
                const totalUsers = yield User_1.UserSchema.countDocuments(query);
                const finalData = {
                    data: users,
                    pagination: {
                        total: totalUsers,
                        page: pageNumber,
                        limit: limitNumber,
                        totalPages: Math.ceil(totalUsers / limitNumber),
                    },
                };
                return (0, response_1.responseStatus)(res, 200, messages_1.msg.user.fetched, finalData);
            }
            catch (error) {
                console.error(error);
                return (0, response_1.responseStatus)(res, 500, 'An error occurred while fetching users.', null);
            }
        });
        this.getUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                let userId = req.params.userId;
                if (!userId) {
                    return (0, response_1.responseStatus)(res, 400, messages_1.msg.user.notFound, null);
                }
                let userExist = yield User_1.UserSchema.findOne({ _id: userId });
                if (userExist) {
                    return (0, response_1.responseStatus)(res, 200, messages_1.msg.user.fetched, userExist);
                }
                else {
                    return (0, response_1.responseStatus)(res, 400, 'error fetching user Details', null);
                }
            }
            catch (error) {
                console.error(error);
                return (0, response_1.responseStatus)(res, 500, 'An error occurred while fetching user.', null);
            }
        });
        this.deleteUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                let userId = req.params.userId;
                let deletUser = yield User_1.UserSchema.findByIdAndDelete({ _id: userId });
                if (deletUser) {
                    return (0, response_1.responseStatus)(res, 200, messages_1.msg.user.deleted, deletUser);
                }
                else {
                    return (0, response_1.responseStatus)(res, 400, 'error deleting user', null);
                }
            }
            catch (error) {
                console.error(error);
                return (0, response_1.responseStatus)(res, 500, 'An error occurred while deleting user.', null);
            }
        });
    }
}
exports.UserService = UserService;
