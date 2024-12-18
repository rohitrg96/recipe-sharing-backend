"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const api_routes_1 = __importDefault(require("./routes/api.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5080;
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Database connection
(0, db_1.default)();
// Routes
app.get('/', (req, res) => {
    res.send('Recipe Sharing API');
});
app.use('/api', api_routes_1.default);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
