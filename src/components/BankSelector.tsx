import React, { useState, useEffect } from 'react';
import './BankSelector.css';

interface BankSelectorProps {
  onSelectBank: (bankCode: string) => void;
}

const banks = [
  { code: '001', name: 'Banco do Brasil', logo: '/assets/logos/001.jpeg' },
  { code: '341', name: 'Itaú', logo: '/assets/logos/341.jpeg' },
  { code: '341F', name: 'Itaú Francesa', logo: '/assets/logos/341F.jpeg' },
  { code: '756', name: 'Sicoob', logo: '/assets/logos/756.jpeg' },
  { code: '748', name: 'Sicredi', logo: '/assets/logos/748.jpeg' },
  { code: '748V', name: 'Sicredi v3', logo: '/assets/logos/748V.jpeg' },
  { code: '104', name: 'Caixa', logo: '/assets/logos/104.svg' },
  { code: '033', name: 'Santander', logo: '/assets/logos/033.jpeg' },
  { code: '041', name: 'Banrisul', logo: '/assets/logos/041.jpeg' },
  { code: '077', name: 'Inter', logo: '/assets/logos/077.jpeg' },
];

const BankSelector: React.FC<BankSelectorProps> = ({ onSelectBank }) => {
  const [selectedBank, setSelectedBank] = useState<string>(''); // Banco selecionado
  const [banksWithErrors, setBanksWithErrors] = useState<string[]>([]); // Bancos com erro nas últimas requisições

  const handleSelectBank = (bankCode: string) => {
    setSelectedBank(bankCode);
    onSelectBank(bankCode);
  };

  useEffect(() => {
    const fetchBanksWithErrors = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/last-errors');
        const data: { banco_codigo: string }[] = await response.json();

        // Obter os bancos com erros
        const erroredBanks = new Set(data.map((entry: any) => entry.banco_codigo));
        setBanksWithErrors(Array.from(erroredBanks)); // Converte o Set para array
      } catch (error) {
        console.error('Erro ao buscar bancos com erros:', error);
      }
    };

    fetchBanksWithErrors();
  }, []);

  return (
    <div className="bank-selector">
      {banks.map((bank) => (
        <button
          key={bank.code}
          className={`bank-button ${
            selectedBank === bank.code ? 'selected' : ''
          } ${banksWithErrors.includes(bank.code) ? 'error' : ''}`}
          onClick={() => handleSelectBank(bank.code)}
        >
          <img src={bank.logo} alt={bank.name} className="bank-logo" />
          <span>{bank.name}</span>
        </button>
      ))}
    </div>
  );
};

export default BankSelector;
