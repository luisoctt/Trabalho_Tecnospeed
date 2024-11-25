"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const monitorRoutes_1 = __importDefault(require("./routes/monitorRoutes"));
const dotenv_1 = __importDefault(require("dotenv"));
require("./services/scheduler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
//app.use(cors()); // Permite todas as origens e métodos
app.use((0, cors_1.default)());
app.use(express_1.default.json()); // Middleware para processar JSON
console.log('Middleware CORS configurado.');
app.use('/api', monitorRoutes_1.default); // Rotas para monitoramento
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
