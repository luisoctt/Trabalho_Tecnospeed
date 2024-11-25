import React, { useEffect, useState, useRef } from 'react';
import {
  Chart as ChartJS,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';

interface ResponseData {
  time: string; // Horário da requisição
  responseTime: string; // Tempo de resposta como string
  statusCode: string; // Código de status
}

interface ErrorChartProps {
  bankCode: string;
  selectedPeriod: string; 
}

// Registrar os componentes necessários do Chart.js
ChartJS.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

// Lista de códigos de erro
const errorStatusCodes = ['ECONRESET', 'EHOUSTUNREACH', '500', '504'];

// Função para simplificar o tempo de resposta para 3 dígitos
const simplifyResponseTime = (responseTime: string) => {
  return parseFloat(responseTime).toFixed(0); // Arredonda para número inteiro
};

const ErrorChart: React.FC<ErrorChartProps> = ({ bankCode, selectedPeriod }) => {
  const [chartData, setChartData] = useState<ChartData<'line'>>({
    labels: [],
    datasets: [
      {
        label: 'Tempo de Resposta (ms)',
        data: [],
        backgroundColor: [],
        borderColor: 'rgba(0, 123, 255, 1)',
        pointBackgroundColor: [],
        pointBorderColor: [],
        borderWidth: 2,
        pointRadius: window.innerWidth < 430 ? 3 : 5, // Adicione diretamente aqui
        pointHoverRadius: window.innerWidth < 430 ? 4 : 6,
      },
    ],
  });

  const chartRef = useRef<ChartJS<'line'> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const fetchResponseTimes = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/response-times/${bankCode}?period=${selectedPeriod}`
        );
        let responseData: ResponseData[] = await response.json();

        // Inverter a ordem dos dados para exibir os mais recentes à direita
        responseData = responseData.reverse();

        // Mapeia os dados retornados pela API
        const labels = responseData.map((item) => item.time); // Horários no eixo X
        const data = responseData.map((item) => {
          const isError = errorStatusCodes.includes(item.statusCode); // Verifica se é um erro
          const adjustedResponseTime = isError ? 2500 : Number(simplifyResponseTime(item.responseTime)); // Define o Y no topo para erros

          return {
            x: item.time, // Ponto no eixo X
            y: adjustedResponseTime, // Tempo ajustado para erros ou simplificado
            statusCode: item.statusCode, // Código de status associado
          };
        });

        const pointColors = responseData.map((item) => {
          const isError = errorStatusCodes.includes(item.statusCode); // Verifica se é um erro
          if (isError) return 'rgba(255, 0, 0, 1)'; // Vermelho para erros
          if (Number(simplifyResponseTime(item.responseTime)) > 1000) return 'rgba(255, 165, 0, 1)'; // Laranja para lentidão
          return 'rgba(0, 123, 255, 1)'; // Azul para respostas rápidas
        });

        setChartData({
          labels,
          datasets: [
            {
              label: 'Tempo de Resposta (ms)',
              data: data as any, // Força o tipo para lidar com o Chart.js
              backgroundColor: pointColors,
              borderColor: 'rgba(0, 123, 255, 1)',
              pointBackgroundColor: pointColors,
              pointBorderColor: pointColors,
              borderWidth: 2,
              pointRadius: window.innerWidth < 430 ? 3 : 5, // Adicione diretamente aqui
              pointHoverRadius: window.innerWidth < 430 ? 4 : 6, // Tamanho ao passar o mouse
            },
          ],
        });
      } catch (error) {
        console.error('Erro ao buscar tempos de resposta:', error);
      }
    };

    fetchResponseTimes();
  }, [bankCode]);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
    }
  
    if (canvasRef.current && chartData.labels && chartData.labels.length > 0) {
      chartRef.current = new ChartJS<'line'>(canvasRef.current, {
        type: 'line',
        data: chartData,
        options: {
          responsive: true,
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => {
                  const raw = context.raw as { x: string; y: number; statusCode: string };
                  if (raw.y === 2500) {
                    return `Erro\nStatus: ${raw.statusCode}`;
                  }
                  return `Tempo de resposta: ${raw.y}ms\nStatus: ${raw.statusCode}`;
                },
              },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Horário',
              },
            },
            y: {
              title: {
                display: true,
                text: 'Tempo de Resposta (ms/segundos)',
              },
              ticks: {
                callback: (value) => {
                  const numericValue = Number(value);
                  if (numericValue === 2550) {return 'Erro'} // Rótulo personalizado no topo
                  else if (numericValue >= 1000) {
                    return `${(numericValue / 1000).toFixed(1)}s`; // Converte valores acima de 1000ms para segundos
                  }
                  return `${numericValue}ms`; // Mantém milissegundos para valores abaixo de 1000ms
                  return value; // Outros valores normais
                },
              },
              min: 0,
              max: 2550, // Estende o eixo Y para incluir o rótulo "Erro"
            },
          },
          elements: {
            point: {
              radius: window.innerWidth < 430 ? 3 : 5, // Tamanhos menores
              hoverRadius: window.innerWidth < 430 ? 4 : 6, // Ajusta tamanho no hover
              hitRadius: window.innerWidth < 430 ? 5 : 7, // Expande o ponto para interação
            },
          },
        },
      });
    }
  }, [chartData]);

  return (
    <div className="chart-container">
      <h2>Monitoramento das Requisições</h2>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default ErrorChart;
