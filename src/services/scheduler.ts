import cron from 'node-cron';
import { monitorRegisterBoleto } from '../controllers/monitorController';
import { getPayloadForBank } from './bankPayloads'; // Importa os payloads dinâmicos

// Lista de códigos de bancos para monitorar
const banks = ['001', '341', '756', '748', '104', '033', '041', '077', '341F', '748V'];

// Agendar monitoramento a cada 5 minutos
cron.schedule('*/5 * * * *', async () => {
  for (const bankCode of banks) {
    try {
      const boletoData = getPayloadForBank(bankCode); // Obter os dados específicos para o banco
      if (!boletoData) {
        console.error(`Nenhum payload configurado para o banco ${bankCode}`);
        continue;
      }
      
      await monitorRegisterBoleto(bankCode, boletoData);
      console.log(`Monitoramento realizado com sucesso para o banco ${bankCode}`);
    } catch (error) {
      console.error(`Erro ao monitorar banco ${bankCode}:`);
    }
  }
});
