import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { DaoProvider } from './context/DaoContext';

// Import thirdweb provider and Rinkeby ChainId
import { ChainId, ThirdwebProvider } from '@thirdweb-dev/react';

// This is the chainId your dApp will work on.
const activeChainId = ChainId.Rinkeby;

// Wrap your app with the thirdweb provider
ReactDOM.render(
  <ThirdwebProvider desiredChainId={activeChainId}>
    <DaoProvider>
      <App />
    </DaoProvider>
  </ThirdwebProvider>,
  document.getElementById('root'),
);
