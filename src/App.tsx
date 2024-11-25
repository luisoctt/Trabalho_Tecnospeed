import React, { useState } from 'react';
import './styles/App.css';
import Header from './components/Header';
import BankSelector from './components/BankSelector';
import ErrorChart from './components/ErrorChart';
import Advertisement from './components/Advertisement';
import ErrorTable from './components/ErrorTable';

const App: React.FC = () => {
  const [selectedBank, setSelectedBank] = useState<string>('001'); // Banco do Brasil como padrão
  const [selectedPeriod, setSelectedPeriod] = useState<string>('24h'); // Período padrão

  const handleSelectBank = (bankCode: string) => {
    setSelectedBank(bankCode);
  };

  const handleSelectPeriod = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPeriod(event.target.value);
  };

  return (
    <div className="App">    
      {/* Menu principal */}
      <Header />
      
      {/* Controles: Seleção de bancos e período */}
      <div className="controls">
      <p className="info-text">Selecione um banco e monitore sua API em tempo real!</p>
        <BankSelector onSelectBank={handleSelectBank} />
        <div className="dropdown-container">
          <label htmlFor="period-select">Selecione o Período:</label>
          <select id="period-select" value={selectedPeriod} onChange={handleSelectPeriod}>
            <option value="24h">Últimas 24 horas</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
          </select>
        </div>
      </div>

      {/* Gráfico */}
      <main>
        <ErrorChart bankCode={selectedBank} selectedPeriod={selectedPeriod} />
      </main>

      {/* Anúncio ou espaço adicional */}
      <Advertisement />
      <ErrorTable bankCode={selectedBank} />
    </div>
  );
};

export default App;
