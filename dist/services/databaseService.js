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
exports.saveError = exports.saveRequest = exports.query = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Configurar o tipo TIMESTAMP para interpretar o fuso horário BRT
pg_1.types.setTypeParser(1114, (str) => str); // Retorna o horário como string diretamente
// Configuração do pool de conexões do PostgreSQL
const pool = new pg_1.Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
});
// Função para obter uma conexão do pool
const query = (text, params) => pool.query(text, params);
exports.query = query;
// Salvar uma requisição de monitoramento no banco de dados
const saveRequest = (requestData) => __awaiter(void 0, void 0, void 0, function* () {
    const queryText = `
    INSERT INTO request_boletos (banco_codigo, status_code, tipo_operacao, tempo_resposta, payload, data_envio)
    VALUES ($1, $2, $3, $4, $5, $6)
  `;
    yield pool.query(queryText, [
        requestData.banco_codigo,
        requestData.status_code,
        requestData.tipo_operacao,
        requestData.tempo_resposta,
        requestData.payload,
        requestData.data_envio,
    ]);
});
exports.saveRequest = saveRequest;
// Salvar um erro no banco de dados
const saveError = (errorData) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Salvando erro no banco:', errorData);
    const queryText = `
    INSERT INTO errors (banco_codigo, tipo_operacao, status_code, erro_mensagem, data_criacao)
    VALUES ($1, $2, $3, $4, $5)
  `;
    yield pool.query(queryText, [
        errorData.banco_codigo,
        errorData.tipo_operacao,
        errorData.status_code,
        errorData.erro_mensagem,
        errorData.data_criacao,
    ]);
});
exports.saveError = saveError;
