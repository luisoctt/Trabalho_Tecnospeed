import express from 'express';
import { query } from '../services/databaseService';
import { monitorRegisterBoleto } from '../controllers/monitorController';
import { getRecentErrors } from '../controllers/monitorController';
import { getRequestStatus } from '../controllers/monitorController';
import { getResponseTimesByPeriod } from '../controllers/monitorController';
import { getRecentErrorsByBank } from '../controllers/monitorController';

const router = express.Router();

router.get('/recent-errors/:bankCode', getRecentErrorsByBank);
router.get('/status/:bankCode', getRequestStatus);
router.get('/errors/:bankCode', getRecentErrors);
// Rota para iniciar monitoramento do registro de boletos
router.post('/monitor/register/:bankCode', async (req, res) => {
  try {
    const data = req.body;
    const bankCode = req.params.bankCode;
    const result = await monitorRegisterBoleto(bankCode, data);
    res.json(result);
  } catch (error: any) {
    console.error('Erro na rota /monitor/register:', error);
    res.status(500).json({ error: error.message || 'Erro ao monitorar registro de boleto' });
  }
});
// Rota para pegar a resposta dos bancos
router.get('/response-times/:bankCode', getResponseTimesByPeriod);

//Rota pra pegar os ultimos 3 registros de cada banco, e se houver algum erro exibir em vermelho no seletor de banco do frontend
router.get('/last-errors', async (req, res) => {
  try {
    const result = await query(`
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
  } catch (error: any) {
    console.error('Erro ao buscar últimas requisições com erro:', error.message);
    res.status(500).json({ error: 'Erro ao buscar últimas requisições com erro' });
  }
});

export default router;