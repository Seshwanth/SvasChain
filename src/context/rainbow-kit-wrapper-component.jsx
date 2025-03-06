import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  polygonAmoy,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import { createContext, useContext, useState } from 'react';
import NavBar from './nav-bar';

// Create context for wallet address
export const WalletContext = createContext({
  walletAddress: '',
  setWalletAddress: () => {},
});

// Custom hook to use wallet context
export const useWallet = () => useContext(WalletContext);

const config = getDefaultConfig({
  appName: 'SvasChain',
  projectId: 'YOUR_PROJECT_ID',
  chains: [polygonAmoy],
  ssr: true,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const RainbowKitWrapperComponent = ({children}) => {
  const [walletAddress, setWalletAddress] = useState('');

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <WalletContext.Provider value={{ walletAddress, setWalletAddress }}>
            <NavBar />
            {children}
          </WalletContext.Provider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default RainbowKitWrapperComponent;