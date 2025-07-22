import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WalletContext from './contexts/WalletContext';
import PayeesProvider from './contexts/PayeesContext';
import TransactionsProvider from './contexts/TransactionsContext';
import PayrollsProvider from './contexts/PayrollsContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import GrowthPage from './pages/GrowthPage';
import PayeesPage from './pages/PayeesPage';
import PayrollPage from './pages/PayrollPage';
import PaymentPage from './pages/PaymentPage';
import PayRequestPage from './pages/PayRequestPage';
import InvoicesPage from './pages/InvoicesPage';
import InvoiceCreatePage from './pages/InvoiceCreatePage';
import BusinessInfoPage from './pages/BusinessInfoPage';
import AllInvoicesPage from './pages/AllInvoicesPage';
import ApiPage from './pages/ApiPage';
import PaymentGatewayPage from './pages/PaymentGatewayPage';
import FinancialInsightPage from './pages/FinancialInsightPage';
import { FaXTwitter, FaEnvelope } from 'react-icons/fa6';
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
                    <Route path="/landing" element={<LandingPage />} />
                    <Route path="/growth" element={<GrowthPage />} />
                    <Route path="/financial-insights" element={<FinancialInsightPage />} />
                    <Route path="/payroll" element={<PayeesPage />} />
                    <Route path="/payroll/run" element={<PayrollPage />} />
                    <Route path="/history" element={<PayeesPage initialTab="history" />} />
                    <Route path="/pay" element={<PaymentPage />} />
                    <Route path="/pay-request" element={<PayRequestPage />} />
                    <Route path="/invoices" element={<InvoicesPage />} />
                    <Route path="/invoices/create" element={<InvoiceCreatePage />} />
                    <Route path="/invoices/all" element={<AllInvoicesPage />} />
                    <Route path="/business-info" element={<BusinessInfoPage />} />
                    <Route path="/api" element={<ApiPage />} />
                    <Route path="/payment-gateway" element={<PaymentGatewayPage />} />
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

                      <div className="flex flex-col items-center justify-center md:justify-end space-y-2">
                        <a 
                          href="https://x.com/project_sienna" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors flex items-center gap-1 text-gray-600 w-full justify-center md:justify-start"
                        >
                          <FaXTwitter className="text-lg" /> 
                          <span className="text-sm">project_sienna</span>
                        </a>
                        <a 
                          href="mailto:contact@projectsienna.xyz" 
                          className="hover:text-primary transition-colors flex items-center gap-1 text-gray-600 w-full justify-center md:justify-start"
                        >
                          <FaEnvelope className="text-lg" /> 
                          <span className="text-sm">contact@projectsienna.xyz</span>
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
