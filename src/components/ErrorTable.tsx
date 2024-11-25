import React, { useState, useEffect } from 'react';

interface ErrorData {
  banco: string;
  statusCode: string;
  mensagem: string;
  dataHora: string;
}

interface ErrorTableProps {
  bankCode: string;
}

const ErrorTable: React.FC<ErrorTableProps> = ({ bankCode }) => {
  const [errors, setErrors] = useState<ErrorData[]>([]);

  useEffect(() => {
    const fetchErrors = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/recent-errors/${bankCode}`);
        const data: ErrorData[] = await response.json();
        setErrors(data);
      } catch (error) {
        console.error('Erro ao buscar erros:', error);
      }
    };

    fetchErrors();
  }, [bankCode]);

  return (
    <div className="error-table-container">
      <h2>Últimos Erros do Banco {bankCode}</h2>
      <table className="error-table">
        <thead>
          <tr>
            <th>Status Code</th>
            <th>Mensagem De Erro</th>
            <th>Data e Hora</th>
          </tr>
        </thead>
        <tbody>
          {errors.length > 0 ? (
            errors.map((error, index) => (
              <tr key={index}>
                <td>{error.statusCode}</td>
                <td>{error.mensagem}</td>
                <td>{new Date(error.dataHora).toLocaleString('pt-BR')}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3}>Nenhum erro encontrado.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ErrorTable;
