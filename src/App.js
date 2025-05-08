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
import PaymentPage from './pages/PaymentPage';
import PayRequestPage from './pages/PayRequestPage';
import ApiPage from './pages/ApiPage';
import { FaXTwitter } from 'react-icons/fa6';
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
                    <Route path="/pay" element={<PaymentPage />} />
                    <Route path="/pay-request" element={<PayRequestPage />} />
                    <Route path="/api" element={<ApiPage />} />
                  </Routes>
                </main>
                <footer className="bg-neutral py-8 mt-8 border-t border-primary border-opacity-20">
                  <div className="container-elegant">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="text-left mb-4 md:mb-0">
                        <p className="text-text font-body text-base mb-1">
                          &copy; {new Date().getFullYear()} Project Sienna
                        </p>
                        <p className="text-primary text-sm font-light italic">
                          Crafted for the Small Biz, Gig Economy, and Freelancers
                        </p>
                      </div>

                      <div className="flex items-center justify-center md:justify-end space-x-4">
                        <a 
                          href="https://x.com/project_sienna" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors flex items-center gap-1 text-gray-600"
                        >
                          <FaXTwitter className="text-lg" /> 
                          <span className="text-sm">project_sienna</span>
                        </a>
                      </div>
                    </div>
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
