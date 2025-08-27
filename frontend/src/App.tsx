import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo } from "react";
import "@solana/wallet-adapter-react-ui/styles.css";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import Index from "./pages/Index";
import Playlist from "./pages/Playlist";
import NotFound from "./pages/NotFound";
import { PlayerProvider } from "@/components/music/PlayerContext";
import { PlayerBar } from "@/components/music/PlayerBar";
import { MusicPlayerLayout } from "@/components/layout/MusicPlayerLayout";

const queryClient = new QueryClient();

// Solana wallet configuration
const SolanaWalletProvider = ({ children }: { children: React.ReactNode }) => {
  const endpoint = useMemo(() => clusterApiUrl("devnet"), []);
  
  // Configure supported wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SolanaWalletProvider>
        <PlayerProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/library" element={<Index />} />
                <Route
                  path="/playlist/:id"
                  element={
                    <MusicPlayerLayout>
                      <Playlist />
                    </MusicPlayerLayout>
                  }
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <PlayerBar />
            </BrowserRouter>
          </TooltipProvider>
        </PlayerProvider>
      </SolanaWalletProvider>
    </QueryClientProvider>
  );
}

export default App;
