import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaUsers, FaBriefcase, FaHistory } from 'react-icons/fa';
import CustomWalletButton from './CustomWalletButton';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'text-secondary font-bold' : 'text-text';
  };

  return (
    <nav className="bg-white shadow-elegant">
      <div className="container-elegant">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-display font-bold text-primary">
                Project Sienna
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                  isActive('/') ? 'border-secondary' : 'border-transparent'
                } ${isActive('/')} hover:text-secondary transition-colors`}
              >
                <FaHome className="mr-2" /> Home
              </Link>
              <Link
                to="/payees"
                className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                  isActive('/payees') ? 'border-secondary' : 'border-transparent'
                } ${isActive('/payees')} hover:text-secondary transition-colors`}
              >
                <FaUsers className="mr-2" /> Payees
              </Link>
              <Link
                to="/payroll"
                className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                  isActive('/payroll') ? 'border-secondary' : 'border-transparent'
                } ${isActive('/payroll')} hover:text-secondary transition-colors`}
              >
                <FaBriefcase className="mr-2" /> Payroll
              </Link>
              <Link
                to="/history"
                className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                  isActive('/history') ? 'border-secondary' : 'border-transparent'
                } ${isActive('/history')} hover:text-secondary transition-colors`}
              >
                <FaHistory className="mr-2" /> History
              </Link>
            </div>
          </div>

          {/* Wallet Button */}
          <div className="flex items-center">
            <CustomWalletButton />
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="sm:hidden border-t border-neutral pt-2 pb-3">
        <div className="flex justify-around">
          <Link
            to="/"
            className={`flex flex-col items-center px-3 py-2 text-sm font-medium ${isActive('/')} hover:text-secondary transition-colors`}
          >
            <FaHome className="text-lg mb-1" />
            Home
          </Link>
          <Link
            to="/payees"
            className={`flex flex-col items-center px-3 py-2 text-sm font-medium ${isActive('/payees')} hover:text-secondary transition-colors`}
          >
            <FaUsers className="text-lg mb-1" />
            Payees
          </Link>
          <Link
            to="/payroll"
            className={`flex flex-col items-center px-3 py-2 text-sm font-medium ${isActive('/payroll')} hover:text-secondary transition-colors`}
          >
            <FaBriefcase className="text-lg mb-1" />
            Payroll
          </Link>
          <Link
            to="/history"
            className={`flex flex-col items-center px-3 py-2 text-sm font-medium ${isActive('/history')} hover:text-secondary transition-colors`}
          >
            <FaHistory className="text-lg mb-1" />
            History
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 