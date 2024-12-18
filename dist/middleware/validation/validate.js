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
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationMiddleware = void 0;
const validationMiddleware = (schema) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let dataToValidate;
        // Handle different HTTP methods and gather data to validate
        switch (req.method) {
            case 'GET':
            case 'DELETE':
                dataToValidate = Object.assign(Object.assign({}, req.query), req.params);
                break;
            case 'POST':
            case 'PUT':
            case 'PATCH':
                dataToValidate = Object.assign(Object.assign({}, req.body), req.params);
                break;
            default:
                res.status(400).json({
                    error: {
                        message: 'Unsupported HTTP method',
                    },
                });
                return;
        }
        // Validate the data using Joi
        const { error } = schema.validate(dataToValidate, { abortEarly: false });
        // If validation fails, return a 400 response with the errors
        if (error) {
            res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: error.details.map((detail) => {
                    var _a;
                    return ({
                        field: (_a = detail.context) === null || _a === void 0 ? void 0 : _a.key,
                        message: detail.message,
                    });
                }),
            });
            return;
        }
        // If validation passes, move on to the next middleware
        next();
    });
};
exports.validationMiddleware = validationMiddleware;
