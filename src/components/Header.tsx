import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-content">
      <a href="https://www.tecnospeed.com.br" target="_blank" rel="noopener noreferrer">
      <img src="/assets/logos/logo_tecnospeed.svg" alt="Logo Tecnosspeed" className="header-logo" />
      </a>
          <h1>Monitor Bancário</h1>
        </div>
    </header>
  );
};

export default Header;