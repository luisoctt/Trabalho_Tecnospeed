import { Pool, types } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configurar o tipo TIMESTAMP para interpretar o fuso horário BRT
types.setTypeParser(1114, (str: string) => str); // Retorna o horário como string diretamente


// Configuração do pool de conexões do PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
});

// Função para obter uma conexão do pool
export const query = (text: string, params?: any) => pool.query(text, params);

// Salvar uma requisição de monitoramento no banco de dados
export const saveRequest = async (requestData: any) => {
  const queryText = `
    INSERT INTO request_boletos (banco_codigo, status_code, tipo_operacao, tempo_resposta, payload, data_envio)
    VALUES ($1, $2, $3, $4, $5, $6)
  `;
  await pool.query(queryText, [
    requestData.banco_codigo,
    requestData.status_code,
    requestData.tipo_operacao,
    requestData.tempo_resposta,
    requestData.payload,
    requestData.data_envio,
  ]);
};

// Salvar um erro no banco de dados
export const saveError = async (errorData: any) => {
  console.log('Salvando erro no banco:', errorData);
  const queryText = `
    INSERT INTO errors (banco_codigo, tipo_operacao, status_code, erro_mensagem, data_criacao)
    VALUES ($1, $2, $3, $4, $5)
  `;
  await pool.query(queryText, [
    errorData.banco_codigo,
    errorData.tipo_operacao,
    errorData.status_code,
    errorData.erro_mensagem,
    errorData.data_criacao,
  ]);
};
