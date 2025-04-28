import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WalletContext from './contexts/WalletContext';
import PayeesProvider from './contexts/PayeesContext';
import TransactionsProvider from './contexts/TransactionsContext';
import PayrollsProvider from './contexts/PayrollsContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import PayeesPage from './pages/PayeesPage';
import PayrollPage from './pages/PayrollPage';
import './App.css';

function App() {
  return (
    <WalletContext>
      <PayeesProvider>
        <TransactionsProvider>
          <PayrollsProvider>
            <Router>
              <div className="flex flex-col min-h-screen bg-background">
                <Navbar />
                <main className="flex-1 container-elegant py-8">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/payroll" element={<PayeesPage />} />
                    <Route path="/payroll/run" element={<PayrollPage />} />
                    <Route path="/history" element={<PayeesPage initialTab="history" />} />
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
          </PayrollsProvider>
        </TransactionsProvider>
      </PayeesProvider>
    </WalletContext>
  );
}

export default App;
