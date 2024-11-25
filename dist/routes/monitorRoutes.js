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
const express_1 = __importDefault(require("express"));
const databaseService_1 = require("../services/databaseService");
const monitorController_1 = require("../controllers/monitorController");
const monitorController_2 = require("../controllers/monitorController");
const monitorController_3 = require("../controllers/monitorController");
const monitorController_4 = require("../controllers/monitorController");
const monitorController_5 = require("../controllers/monitorController");
const router = express_1.default.Router();
router.get('/recent-errors/:bankCode', monitorController_5.getRecentErrorsByBank);
router.get('/status/:bankCode', monitorController_3.getRequestStatus);
router.get('/errors/:bankCode', monitorController_2.getRecentErrors);
// Rota para iniciar monitoramento do registro de boletos
router.post('/monitor/register/:bankCode', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        const bankCode = req.params.bankCode;
        const result = yield (0, monitorController_1.monitorRegisterBoleto)(bankCode, data);
        res.json(result);
    }
    catch (error) {
        console.error('Erro na rota /monitor/register:', error);
        res.status(500).json({ error: error.message || 'Erro ao monitorar registro de boleto' });
    }
}));
// Rota para pegar a resposta dos bancos
router.get('/response-times/:bankCode', monitorController_4.getResponseTimesByPeriod);
//Rota pra pegar os ultimos 3 registros de cada banco, e se houver algum erro exibir em vermelho no seletor de banco do frontend
router.get('/last-errors', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, databaseService_1.query)(`
      SELECT banco_codigo, status_code, data_envio
      FROM (
        SELECT 
          banco_codigo, 
          status_code, 
          data_envio,
          ROW_NUMBER() OVER (PARTITION BY banco_codigo ORDER BY data_envio DESC) AS row_num
        FROM request_boletos
      ) subquery
      WHERE row_num <= 3 AND status_code IN ('500', '504', 'ECONRESET', 'EHOUSTUNREACH')
      ORDER BY banco_codigo, data_envio DESC;
    `);
        res.json(result.rows);
    }
    catch (error) {
        console.error('Erro ao buscar últimas requisições com erro:', error.message);
        res.status(500).json({ error: 'Erro ao buscar últimas requisições com erro' });
    }
}));
exports.default = router;
