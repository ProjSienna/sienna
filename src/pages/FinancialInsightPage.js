import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  FaChartLine, 
  FaArrowDown, 
  FaArrowUp, 
  FaChartBar,
  FaRegLightbulb,
  FaFileAlt,
  FaDownload,
  FaCalendarAlt,
  FaExternalLinkAlt,
  FaRegClock,
  FaRegChartBar
} from 'react-icons/fa';

const FinancialInsightPage = () => {
  const { publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState('overview');

  // If user is not authenticated, redirect to landing page
  if (!publicKey) {
    return <Navigate to="/landing" />;
  }

  // Example data - would be replaced with actual data from your API
  const financialData = {
    incomeTotal: '25,000 USDC',
    expensesTotal: '8,500 USDC',
    netCashflow: '16,500 USDC',
    healthScore: 85,
    yieldEarnings: '1,250 USDC',
    currentAPY: '5.2%',
    forecastSummary: '+10,500 USDC',
    monthlyForecasts: [
      { month: 'June', amount: '+3,200 USDC' },
      { month: 'July', amount: '+3,500 USDC' },
      { month: 'August', amount: '+3,800 USDC' }
    ],
    incomeBreakdown: [
      { category: 'Client Payments', amount: '15,000 USDC', percentage: 60 },
      { category: 'Recurring Income', amount: '8,500 USDC', percentage: 34 },
      { category: 'Yield Earnings', amount: '1,500 USDC', percentage: 6 }
    ],
    expenseBreakdown: [
      { category: 'Business Services', amount: '3,500 USDC', percentage: 41 },
      { category: 'Payroll', amount: '4,200 USDC', percentage: 49 },
      { category: 'Software & Tools', amount: '800 USDC', percentage: 10 }
    ]
  };

  const insights = [
    {
      title: "Cash Flow Analysis",
      content: "Based on your transaction history, your monthly income is approximately 12,000 USDC, while your expenses average around 8,500 USDC. This gives you a positive cash flow of ~3,500 USDC per month.",
      icon: <FaChartLine className="text-primary" />
    },
    {
      title: "Yield Optimization",
      content: "Depositing an additional 10,000 USDC into yield could generate approximately 520 USDC annually at current rates. This would represent a 41.6% increase in your passive income.",
      icon: <FaRegLightbulb className="text-secondary" />
    },
    {
      title: "Expense Patterns",
      content: "Your largest expense category is Payroll at 49% of total expenses. Consider reviewing your team structure or exploring automation tools to optimize this spending.",
      icon: <FaChartBar className="text-primary" />
    },
    {
      title: "Income Diversification",
      content: "60% of your income comes from client payments. To improve stability, aim to increase your recurring income sources and passive yield generation.",
      icon: <FaRegChartBar className="text-secondary" />
    }
  ];

  const renderTab = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Financial Health Score */}
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Financial Health Score</h3>
                  <p className="text-gray-600 text-sm mb-4">Based on income stability, expense management, and growth potential</p>
                </div>
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mr-4 shadow-sm">
                    <span className="text-2xl font-bold text-secondary">{financialData.healthScore}</span>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-800">Excellent</div>
                    <div className="text-gray-500">Top 15% of businesses</div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-sm text-gray-500 mb-1">Net Cashflow</div>
                  <div className="text-xl font-semibold text-primary">{financialData.netCashflow}</div>
                  <div className="flex items-center mt-2 text-xs text-green-600">
                    <FaArrowUp className="mr-1" /> 
                    <span>+15% from last month</span>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-sm text-gray-500 mb-1">Monthly Income</div>
                  <div className="text-xl font-semibold text-primary">{financialData.incomeTotal}</div>
                  <div className="flex items-center mt-2 text-xs text-green-600">
                    <FaArrowUp className="mr-1" /> 
                    <span>+12% from last month</span>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-sm text-gray-500 mb-1">Monthly Expenses</div>
                  <div className="text-xl font-semibold text-secondary">{financialData.expensesTotal}</div>
                  <div className="flex items-center mt-2 text-xs text-red-500">
                    <FaArrowUp className="mr-1" /> 
                    <span>+5% from last month</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* AI Insights */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">AI-Powered Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map((insight, idx) => (
                  <div key={idx} className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-primary">
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        {insight.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 mb-1">{insight.title}</h4>
                        <p className="text-sm text-gray-600">{insight.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Forecast */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FaCalendarAlt className="mr-2 text-primary" /> 3-Month Forecast
              </h3>
              
              <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-5">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex space-x-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      <span className="w-2 h-2 bg-primary rounded-full mr-1"></span>
                      Income
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                      Expenses
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
                      <span className="w-2 h-2 bg-secondary rounded-full mr-1"></span>
                      Net
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    AI-powered prediction
                  </div>
                </div>
                
                <div className="relative h-48 mb-6 border border-gray-100 rounded-lg bg-white">
                  {/* This would be replaced with a real chart component */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-gray-500 text-sm">Forecast Summary:</p>
                      <p className="text-2xl font-bold text-primary mt-1">{financialData.forecastSummary}</p>
                      <p className="text-xs text-gray-500 mt-1">Projected 3-month surplus</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  {financialData.monthlyForecasts.map((forecast, idx) => (
                    <div key={idx} className="bg-white rounded-lg shadow-sm p-3">
                      <p className="text-xs text-gray-500">{forecast.month}</p>
                      <p className="text-sm font-medium text-primary">{forecast.amount}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 'income':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FaArrowDown className="mr-2 text-primary" /> Income Breakdown
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-sm text-gray-600">Total Monthly Income</div>
                  <div className="text-xl font-semibold text-primary">{financialData.incomeTotal}</div>
                </div>
                
                <div className="space-y-4">
                  {financialData.incomeBreakdown.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-sm text-gray-600">{item.category}</div>
                        <div className="text-sm font-medium">{item.amount}</div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium text-gray-800 mb-2">Income Optimization Opportunities</h4>
                <div className="space-y-4 mt-4">
                  <div className="flex items-start p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                      <FaRegLightbulb className="text-primary" />
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-800 mb-1">Increase Recurring Revenue</h5>
                      <p className="text-sm text-gray-600">Consider implementing subscription models or retainer contracts to increase your recurring income from 34% to 50%+ of total income.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-4 bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center mr-3">
                      <FaRegClock className="text-secondary" />
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-800 mb-1">Leverage Yield Opportunities</h5>
                      <p className="text-sm text-gray-600">Increase your yield earnings by depositing idle funds into our Growth product. Moving an additional 10,000 USDC could add 520 USDC in annual passive income.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'expenses':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FaArrowUp className="mr-2 text-secondary" /> Expense Breakdown
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-sm text-gray-600">Total Monthly Expenses</div>
                  <div className="text-xl font-semibold text-secondary">{financialData.expensesTotal}</div>
                </div>
                
                <div className="space-y-4">
                  {financialData.expenseBreakdown.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-sm text-gray-600">{item.category}</div>
                        <div className="text-sm font-medium">{item.amount}</div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-secondary h-2 rounded-full" 
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium text-gray-800 mb-2">Expense Optimization Opportunities</h4>
                <div className="space-y-4 mt-4">
                  <div className="flex items-start p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                      <FaRegLightbulb className="text-primary" />
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-800 mb-1">Optimize Payroll Expenses</h5>
                      <p className="text-sm text-gray-600">Consider automation tools or project management platforms to enhance team productivity. This could potentially reduce payroll costs by 10-15% while maintaining output quality.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-4 bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center mr-3">
                      <FaFileAlt className="text-secondary" />
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-800 mb-1">Review Service Subscriptions</h5>
                      <p className="text-sm text-gray-600">We&apos;ve identified potential overlaps in your business service subscriptions. Consolidating these could save approximately 300 USDC monthly.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
            <FaChartLine className="mr-3 text-primary" />
            Financial Insights
          </h1>
          <p className="text-gray-600">Detailed analysis and optimization opportunities for your business</p>
        </div>
        
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Link to="/" className="text-sm text-primary flex items-center">
            <FaExternalLinkAlt className="mr-1 text-xs" />
            Back to Dashboard
          </Link>
          <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm flex items-center hover:bg-primary/90 transition-colors">
            <FaDownload className="mr-2" />
            Export Report
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md mb-6">
        <div className="flex overflow-x-auto border-b">
          <button 
            className={`px-6 py-3 text-sm font-medium ${activeTab === 'overview' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-primary'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`px-6 py-3 text-sm font-medium ${activeTab === 'income' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-primary'}`}
            onClick={() => setActiveTab('income')}
          >
            Income Analysis
          </button>
          <button 
            className={`px-6 py-3 text-sm font-medium ${activeTab === 'expenses' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-primary'}`}
            onClick={() => setActiveTab('expenses')}
          >
            Expense Analysis
          </button>
        </div>
      </div>
      
      {/* Tab Content */}
      {renderTab()}
    </div>
  );
};

export default FinancialInsightPage; 