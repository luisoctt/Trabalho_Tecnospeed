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
const node_cron_1 = __importDefault(require("node-cron"));
const monitorController_1 = require("../controllers/monitorController");
const bankPayloads_1 = require("./bankPayloads"); // Importa os payloads dinâmicos
// Lista de códigos de bancos para monitorar
const banks = ['001', '341', '756', '748', '104', '033', '041', '077', '341F', '748V'];
// Agendar monitoramento a cada 5 minutos
node_cron_1.default.schedule('*/5 * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    for (const bankCode of banks) {
        try {
            const boletoData = (0, bankPayloads_1.getPayloadForBank)(bankCode); // Obter os dados específicos para o banco
            if (!boletoData) {
                console.error(`Nenhum payload configurado para o banco ${bankCode}`);
                continue;
            }
            yield (0, monitorController_1.monitorRegisterBoleto)(bankCode, boletoData);
            console.log(`Monitoramento realizado com sucesso para o banco ${bankCode}`);
        }
        catch (error) {
            console.error(`Erro ao monitorar banco ${bankCode}:`);
        }
    }
}));
