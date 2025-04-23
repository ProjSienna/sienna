import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WalletContext from './contexts/WalletContext';
import PayeesProvider from './contexts/PayeesContext';
import TransactionsProvider from './contexts/TransactionsContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import PayeesPage from './pages/PayeesPage';
import PayrollPage from './pages/PayrollPage';
import HistoryPage from './pages/HistoryPage';
import './App.css';

function App() {
  return (
    <WalletContext>
      <PayeesProvider>
        <TransactionsProvider>
          <Router>
            <div className="flex flex-col min-h-screen bg-background">
              <Navbar />
              <main className="flex-1 container-elegant py-8">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/payees" element={<PayeesPage />} />
                  <Route path="/payroll" element={<PayrollPage />} />
                  <Route path="/history" element={<HistoryPage />} />
                </Routes>
              </main>
              <footer className="bg-neutral text-center py-8 mt-8 border-t border-primary border-opacity-20">
                <div className="container-elegant">
                  <p className="text-text font-body text-base">
                    &copy; {new Date().getFullYear()} Project Sienna - USDC Payroll on Solana
                  </p>
                  <p className="text-primary text-sm mt-2 font-light italic">
                    Elegantly crafted for the Solana community
                  </p>
                </div>
              </footer>
            </div>
          </Router>
        </TransactionsProvider>
      </PayeesProvider>
    </WalletContext>
  );
}

export default App;
