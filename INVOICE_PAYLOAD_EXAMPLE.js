/**
 * INVOICE CREATION API - EXAMPLE PAYLOAD
 * 
 * This is a complete, ready-to-use example of the invoice creation payload.
 * Copy this structure when testing or debugging the API.
 */

const exampleInvoicePayload = {
  invoiceData: {
    // ========== INVOICE METADATA ==========
    invoice_info: {
      invoice_number: "INV-847293",
      issue_date: "2025-10-16",
      due_date: "2025-10-31",
      currency: "USD",
      tax_rate: 0.0825,                    // 8.25% tax
      payment_terms: "NET 15",
      status: "DRAFT"                      // DRAFT, SENT, PAID, OVERDUE
    },

    // ========== YOUR BUSINESS INFO (Payee - Who Gets Paid) ==========
    business_info: {
      name: "Acme Consulting LLC",
      contact: {
        email: "billing@acmeconsulting.com",
        phone: "+1 (555) 123-4567"
      },
      address: {
        street: "123 Business Ave",
        city: "San Francisco",
        state: "CA",
        zip: "94102",
        country: "USA"
      }
    },

    // ========== CLIENT INFO (Payer - Who Pays) ==========
    client_info: {
      name: "TechCorp Industries",
      contact: {
        name: "TechCorp Industries",
        email: "accounts.payable@techcorp.com",
        phone: "+1 (555) 987-6543"
      },
      address: {
        street: "456 Client Street",
        city: "New York",
        state: "NY",
        zip: "10001",
        country: "USA"
      },
      wallet_address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"  // Optional
    },

    // ========== SERVICES/PRODUCTS ==========
    line_items: [
      {
        description: "Web Development Services - Frontend Implementation",
        quantity: 40,
        unit_price: 150,
        amount: 6000                       // 40 × $150
      },
      {
        description: "UI/UX Design Consultation",
        quantity: 10,
        unit_price: 200,
        amount: 2000                       // 10 × $200
      },
      {
        description: "Backend API Integration",
        quantity: 20,
        unit_price: 175,
        amount: 3500                       // 20 × $175
      }
    ],

    // ========== FINANCIAL SUMMARY ==========
    summary: {
      subtotal: 11500,                     // Sum of all line items
      tax_amount: 948.75,                  // 11500 × 0.0825
      discount_type: "percentage",         // "none", "percentage", or "fixed"
      discount_value: 5,                   // 5% discount
      discount_amount: 575,                // 11500 × 0.05
      total_due: 11873.75                  // 11500 + 948.75 - 575
    },

    // ========== TAX JURISDICTION ==========
    tax_info: {
      country: "US",
      state: "CA",
      service_category: "consulting"       // consulting, digital, saas, goods, general
    },

    // ========== ADDITIONAL INFO ==========
    notes: "Payment is due within 15 days. Late payments may incur a 1.5% monthly interest charge. Thank you for your business!",
    footer: "Thank you for your business!",

    // ========== PAYMENT METHODS ==========
    payment_info: {
      // Bank/Wire Transfer
      bank: {
        bank_name: "Chase Bank",
        account_number: "****1234",        // Consider masking in production
        routing_number: "021000021",
        swift_code: "CHASUS33",            // For international wire
        account_holder: "Acme Consulting LLC",
        bank_type: "wire"                  // "wire" or "ach"
      },
      // Cryptocurrency
      crypto: {
        wallet_address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
        chain_type: "solana",              // solana, ethereum, bitcoin, polygon
        token: "USDC"                      // USDC, SOL, ETH, etc.
      }
    },

    // ========== USER CONTEXT ==========
    user_wallet: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"  // Connected wallet
  },

  // Business name (for template/branding)
  businessName: "Acme Consulting LLC"
};

// ========== USAGE EXAMPLE ==========
async function createInvoiceExample() {
  const apiUrl = 'http://localhost:4000';
  
  try {
    console.log('📤 Sending invoice creation request...');
    console.log('Payload:', JSON.stringify(exampleInvoicePayload, null, 2));
    
    const response = await fetch(`${apiUrl}/api/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(exampleInvoicePayload)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Invoice created successfully!');
      console.log('Invoice ID:', result.id);
      console.log('View URL:', result.viewUrl);
      return result;
    } else {
      console.error('❌ Failed to create invoice:', result);
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// ========== MINIMAL EXAMPLE (Required Fields Only) ==========
const minimalInvoicePayload = {
  invoiceData: {
    invoice_info: {
      invoice_number: "INV-123456",
      issue_date: "2025-10-16",
      due_date: "2025-10-31",
      currency: "USD",
      tax_rate: 0,
      payment_terms: "NET 30",
      status: "DRAFT"
    },
    business_info: {
      name: "My Business",
      contact: { email: "me@business.com", phone: "555-0000" },
      address: { street: "123 St", city: "City", state: "ST", zip: "12345", country: "USA" }
    },
    client_info: {
      name: "Client Name",
      contact: { name: "Client Name", email: "client@email.com", phone: "555-1111" },
      address: { street: "456 St", city: "City", state: "ST", zip: "54321", country: "USA" },
      wallet_address: ""
    },
    line_items: [
      { description: "Service", quantity: 1, unit_price: 100, amount: 100 }
    ],
    summary: {
      subtotal: 100,
      tax_amount: 0,
      discount_type: "none",
      discount_value: 0,
      discount_amount: 0,
      total_due: 100
    },
    tax_info: { country: "US", state: "", service_category: "general" },
    notes: "",
    footer: "Thank you for your business!",
    payment_info: {
      bank: {
        bank_name: "",
        account_number: "",
        routing_number: "",
        swift_code: "",
        account_holder: "",
        bank_type: "ach"
      },
      crypto: {
        wallet_address: "",
        chain_type: "",
        token: ""
      }
    },
    user_wallet: ""
  },
  businessName: "My Business"
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    exampleInvoicePayload,
    minimalInvoicePayload,
    createInvoiceExample
  };
}
