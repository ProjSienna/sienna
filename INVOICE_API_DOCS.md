# Invoice Creation API Documentation

## Endpoint
```
POST http://localhost:4000/api/invoices
```

## Headers
```json
{
  "Content-Type": "application/json"
}
```

## Request Payload Structure

### Complete Example
See `INVOICE_API_EXAMPLE.json` for a full working example.

### Payload Schema

```javascript
{
  invoiceData: {
    invoice_info: {
      invoice_number: string,      // e.g., "INV-847293"
      issue_date: string,           // ISO date: "2025-10-16"
      due_date: string,             // ISO date: "2025-10-31"
      currency: string,             // "USD"
      tax_rate: number,             // Decimal: 0.0825 for 8.25%
      payment_terms: string,        // "NET 15", "NET 30", etc.
      status: string                // "DRAFT", "SENT", "PAID", "OVERDUE"
    },
    business_info: {
      name: string,
      contact: {
        email: string,
        phone: string
      },
      address: {
        street: string,
        city: string,
        state: string,
        zip: string,
        country: string
      }
    },
    client_info: {
      name: string,
      contact: {
        name: string,
        email: string,
        phone: string
      },
      address: {
        street: string,
        city: string,
        state: string,
        zip: string,
        country: string
      },
      wallet_address: string        // Optional: Client's crypto wallet
    },
    line_items: [
      {
        description: string,
        quantity: number,
        unit_price: number,
        amount: number              // quantity * unit_price
      }
    ],
    summary: {
      subtotal: number,
      tax_amount: number,
      discount_type: string,        // "none", "percentage", "fixed"
      discount_value: number,
      discount_amount: number,
      total_due: number
    },
    tax_info: {
      country: string,              // e.g., "US"
      state: string,                // e.g., "CA"
      service_category: string      // e.g., "consulting"
    },
    notes: string,
    footer: string,
    payment_info: {
      bank: {
        bank_name: string,
        account_number: string,
        routing_number: string,
        swift_code: string,         // For wire transfers
        account_holder: string,
        bank_type: string           // "wire" or "ach"
      },
      crypto: {
        wallet_address: string,     // Your business wallet
        chain_type: string,         // "solana", "ethereum", etc.
        token: string               // "USDC", "SOL", etc.
      }
    },
    user_wallet: string             // Connected Solana wallet
  },
  businessName: string
}
```

## Field Descriptions

### Invoice Info
- **invoice_number**: Auto-generated unique identifier (e.g., "INV-847293")
- **issue_date**: Date invoice was created (ISO 8601 format)
- **due_date**: Payment deadline (ISO 8601 format)
- **currency**: Always "USD" currently
- **tax_rate**: Tax percentage as decimal (8.25% = 0.0825)
- **payment_terms**: Options: "NET 7", "NET 15", "NET 30", "NET 60", "DUE ON RECEIPT"
- **status**: Options: "DRAFT", "SENT", "PAID", "OVERDUE"

### Business Info
Your company information (payee - who receives payment):
- Loaded from localStorage `businessInfo`
- Includes name, contact details, and full address

### Client Info
Customer information (payer - who makes payment):
- Uses form fields: `billToName`, `billToEmail`, `billToPhone`, `billToAddress`
- **wallet_address**: Optional - client's crypto wallet if paying via crypto

### Line Items
Array of services/products being billed:
- **description**: What was provided
- **quantity**: Number of units (hours, items, etc.)
- **unit_price**: Price per unit
- **amount**: Calculated as quantity × unit_price

### Summary
Financial totals:
- **subtotal**: Sum of all line item amounts
- **tax_amount**: Calculated from subtotal × tax_rate
- **discount_type**: "none", "percentage", or "fixed"
- **discount_value**: Discount amount or percentage
- **discount_amount**: Calculated discount in dollars
- **total_due**: Final amount = subtotal + tax - discount

### Tax Info
Tax jurisdiction information:
- **country**: Tax country code (e.g., "US", "CA", "UK")
- **state**: State/province code (e.g., "CA", "NY", "ON")
- **service_category**: Type of service for tax purposes

### Payment Info
How to pay the invoice:

**Bank Transfer:**
- **bank_name**: Name of your bank
- **account_number**: Your account number (consider masking)
- **routing_number**: Bank routing number
- **swift_code**: International wire code (if applicable)
- **account_holder**: Name on the account
- **bank_type**: "wire" or "ach"

**Crypto Payment:**
- **wallet_address**: Your business wallet address
- **chain_type**: Blockchain network ("solana", "ethereum", "polygon", etc.)
- **token**: Preferred token ("USDC", "SOL", "ETH", etc.)

### User Wallet
The Solana wallet address of the user creating the invoice (from wallet connection).

## Example Scenarios

### Scenario 1: Consulting Invoice with Discount
```javascript
{
  invoice_info: {
    invoice_number: "INV-847293",
    status: "DRAFT",
    payment_terms: "NET 15"
  },
  line_items: [
    { description: "Consulting Services", quantity: 40, unit_price: 150, amount: 6000 }
  ],
  summary: {
    subtotal: 6000,
    tax_amount: 495,      // 8.25% tax
    discount_type: "percentage",
    discount_value: 10,
    discount_amount: 600,
    total_due: 5895       // 6000 + 495 - 600
  }
}
```

### Scenario 2: Product Invoice, No Discount
```javascript
{
  invoice_info: {
    invoice_number: "INV-123456",
    status: "SENT",
    payment_terms: "NET 30"
  },
  line_items: [
    { description: "Widget A", quantity: 100, unit_price: 25, amount: 2500 },
    { description: "Widget B", quantity: 50, unit_price: 40, amount: 2000 }
  ],
  summary: {
    subtotal: 4500,
    tax_amount: 371.25,
    discount_type: "none",
    discount_value: 0,
    discount_amount: 0,
    total_due: 4871.25
  }
}
```

## Expected Response

### Success (200 OK)
```json
{
  "success": true,
  "id": "67890abcdef12345",
  "_id": "67890abcdef12345",
  "invoiceNumber": "INV-847293",
  "viewUrl": "/view-invoice/67890abcdef12345",
  "pdfUrl": "/invoices/67890abcdef12345/pdf",
  "createdAt": "2025-10-16T08:52:00.000Z",
  "message": "Invoice created successfully"
}
```

### Error (400/500)
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    "Specific validation error 1",
    "Specific validation error 2"
  ]
}
```

## Console Logging

When creating an invoice, the following logs will appear in the browser console:

```
================================================================================
📤 CREATING INVOICE - API REQUEST
================================================================================
🔗 Endpoint: POST http://localhost:4000/api/invoices
👤 User Wallet: 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM
📋 Request Payload: { ... full JSON payload ... }
================================================================================
📥 API Response Status: 200 OK
✅ Invoice Created Successfully!
📄 Response Data: { ... response JSON ... }
🆔 Invoice ID: 67890abcdef12345
🔗 View URL: /view-invoice/67890abcdef12345
================================================================================
```

## Validation Rules

### Required Fields
- `invoiceData.invoice_info.invoice_number`
- `invoiceData.invoice_info.issue_date`
- `invoiceData.invoice_info.due_date`
- `invoiceData.business_info.name`
- `invoiceData.client_info.name`
- `invoiceData.line_items` (at least 1 item)
- `invoiceData.summary.total_due`
- `businessName`

### Optional Fields
- `invoiceData.client_info.wallet_address`
- `invoiceData.payment_info.bank.*` (all bank fields)
- `invoiceData.payment_info.crypto.wallet_address`
- `invoiceData.notes`
- `invoiceData.tax_info.*`
- `invoiceData.summary.discount_*`

## Testing

To test the API call:
1. Fill out the invoice form in the UI
2. Open browser DevTools Console (F12)
3. Click "Create Invoice"
4. Review the logged payload and response

## Notes

- All monetary amounts are in USD
- Tax rate is stored as decimal (0.0825 = 8.25%)
- Dates must be in ISO 8601 format (YYYY-MM-DD)
- The `user_wallet` field associates the invoice with the connected wallet
- Client `wallet_address` is only needed if they're paying via crypto
- Bank account numbers should be masked/encrypted in production
