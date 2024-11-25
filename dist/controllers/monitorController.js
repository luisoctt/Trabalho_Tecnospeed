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
exports.getRecentErrorsByBank = exports.getResponseTimesByPeriod = exports.getRecentErrors = exports.getRequestStatus = exports.monitorRegisterBoleto = void 0;
const axios_1 = __importDefault(require("axios"));
const databaseService_1 = require("../services/databaseService");
const bankPayloads_1 = require("../services/bankPayloads"); // Importa os payloads dinâmicos
const databaseService_2 = require("../services/databaseService");
// Função para monitorar registro de boleto da API
const monitorRegisterBoleto = (bankCode, data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const startTime = Date.now(); // Tempo inicial da requisição
        // Configurar headers da requisição
        const headers = {
            'Content-Type': 'application/json',
            'cnpj-cedente': process.env.API_CNPJ, // CNPJ do cedente
            'token-cedente': process.env.API_TOKEN, // Token do cedente
        };
        const payload = JSON.stringify((0, bankPayloads_1.getPayloadForBank)(bankCode));
        const response = yield axios_1.default.post(process.env.PLUGBOLETO_API_URL, payload, { headers } // Incluindo os headers
        );
        const responseTime = Date.now() - startTime; // Cálculo do tempo de resposta
        // Armazena a resposta de sucesso no banco de dados
        yield (0, databaseService_1.saveRequest)({
            banco_codigo: bankCode, // Código do banco
            status_code: response.status, // Código de status da resposta
            tipo_operacao: 'registro', // Tipo de operação
            tempo_resposta: responseTime, // Tempo de resposta em ms
            payload: response.data, // Payload da resposta
            data_envio: new Date().toISOString(), // Data e hora do envio
        });
        return response.data;
    }
    catch (error) {
        console.error('Erro ao fazer requisição:');
        // Em caso de erro, armazena o erro no banco de dados
        yield (0, databaseService_1.saveError)({
            banco_codigo: bankCode, // Código do banco
            tipo_operacao: 'registro', // Tipo de operação
            status_code: ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) || 500, // Código de status do erro (500 se não houver)
            erro_mensagem: error.message, // Mensagem de erro
            data_criacao: new Date().toISOString(), // Data e hora do erro
        });
        throw error;
    }
});
exports.monitorRegisterBoleto = monitorRegisterBoleto;
// Função principal para consultar e exibir os os status das requsições
const getRequestStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const bankCode = req.params.bankCode;
    try {
        const result = yield (0, databaseService_2.query)(`
      SELECT 
      COUNT(*) AS count,
      CASE
      WHEN status_code IN ('200', '400', '401', '403', '422') THEN 'positivo'
      WHEN status_code IN ('ECONRESET', 'EHOUSTUNREACH', '500', '504') THEN 'negativo'
      ELSE 'outros'
      END AS status
      FROM request_boletos
      WHERE banco_codigo = $1
      GROUP BY status;
      `, [bankCode]);
        // Transformar os dados para garantir o formato correto
        const formattedData = result.rows.map((row) => ({
            count: parseInt(row.count, 10), // Converter 'count' para número
            status: row.status,
        }));
        res.json(formattedData); // Retorna os dados no formato esperado pelo frontend
    }
    catch (error) {
        console.error('Erro ao consultar status de requisições:', error);
        res.status(500).json({ error: 'Erro ao consultar status de requisições' });
    }
});
exports.getRequestStatus = getRequestStatus;
const getRecentErrors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const bankCode = req.params.bankCode;
    try {
        const result = yield (0, databaseService_2.query)(`
      SELECT COUNT(*) AS count, data_criacao AS timestamp
      FROM errors
      WHERE banco_codigo = $1 AND data_criacao >= NOW() - INTERVAL '24 HOURS'
      GROUP BY data_criacao
      ORDER BY data_criacao;
      `, [bankCode] // Parâmetro seguro para evitar injeção de SQL
        );
        res.json(result.rows);
    }
    catch (error) {
        console.error('Erro ao obter erros recentes:', error.message);
        res.status(500).json({ error: 'Erro ao obter erros recentes' });
    }
});
exports.getRecentErrors = getRecentErrors;
const getResponseTimesByPeriod = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const bankCode = req.params.bankCode;
    const period = req.query.period || '24h'; // Período padrão: 24 horas
    let timeInterval;
    let groupBy;
    switch (period) {
        case '7d':
            timeInterval = '7 DAYS';
            groupBy = 'hour';
            break;
        case '30d':
            timeInterval = '30 DAYS';
            groupBy = 'day';
            break;
        default:
            timeInterval = '24 HOURS';
            groupBy = 'minute';
    }
    try {
        const queryText = `
    SELECT 
      date_trunc('${groupBy}', data_envio) AS time_group, -- Agrupamento fixo
      AVG(tempo_resposta) AS avg_response_time,
      MAX(status_code) AS status_code
    FROM request_boletos
    WHERE banco_codigo = $1 AND data_envio >= NOW() - INTERVAL '${timeInterval}' -- Valor de INTERVAL direto
    GROUP BY time_group
    ORDER BY time_group DESC;
  `;
        const result = yield (0, databaseService_2.query)(queryText, [bankCode]);
        // Formatar os dados antes de enviar para o frontend
        const formattedData = result.rows.map(row => ({
            time: new Date(row.time_group).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
            responseTime: parseFloat(row.avg_response_time).toFixed(2),
            statusCode: row.status_code,
        }));
        res.json(formattedData);
    }
    catch (error) {
        console.error('Erro ao buscar tempos de resposta por período:', error);
        res.status(500).json({ error: 'Erro ao buscar tempos de resposta' });
    }
});
exports.getResponseTimesByPeriod = getResponseTimesByPeriod;
const getRecentErrorsByBank = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const bankCode = req.params.bankCode;
    try {
        const result = yield (0, databaseService_2.query)(`
      SELECT banco_codigo, status_code, erro_mensagem, data_hora_erro
      FROM vw_ultimos_erros
      WHERE banco_codigo = $1
      LIMIT 10;
      `, [bankCode]);
        res.json(result.rows.map(row => ({
            banco: row.banco_codigo,
            statusCode: row.status_code,
            mensagem: row.erro_mensagem,
            dataHora: row.data_hora_erro,
        })));
    }
    catch (error) {
        console.error('Erro ao buscar erros recentes:', error);
        res.status(500).json({ error: 'Erro ao buscar erros recentes' });
    }
});
exports.getRecentErrorsByBank = getRecentErrorsByBank;
