import cors from 'cors';
import express from 'express';
import monitorRoutes from './routes/monitorRoutes';
import dotenv from 'dotenv';
import './services/scheduler';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

//app.use(cors()); // Permite todas as origens e métodos

app.use(cors());

app.use(express.json()); // Middleware para processar JSON
console.log('Middleware CORS configurado.');

app.use('/api', monitorRoutes); // Rotas para monitoramento



app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});