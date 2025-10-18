import fs from 'fs';
import OpenAI, { toFile } from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30 * 1000, // 30 second timeout
});

export interface ReceiptDataExtract {
  totalAmount: string;
  merchant_name: string;
  merchant_address: string;
  purchase_date: string;
  sub_total: string;
  tax_total: string;
  total: string;
  currency: string;
  items: Array<{
    name: string;
    quantity: string;
    price: string;
  }>;
}

const receiptExtractionPrompt = `You are an expert at extracting structured data from receipts. Given this image of a receipt, extract the following information in JSON format:
- totalAmount: The total amount paid.
- merchant_name: The name of the merchant.
- merchant_address: The address of the merchant.
- purchase_date: The date of purchase.
- sub_total: The subtotal amount before tax.
- tax_total: The total tax amount.
- total: The final total amount.
- currency: The currency used in the transaction.
- items: A list of items purchased, each with:
  - name: The name of the item.
  - quantity: The quantity purchased.
  - price: The price of the item.

If any information is missing, use an empty string or an empty array as appropriate.

Please provide the extracted data in the following JSON format:
{
  "totalAmount": "",
  "merchant_name": "",
  "merchant_address": "",
  "purchase_date": "",
  "sub_total": "",
  "tax_total": "",
  "total": "",
  "currency": "",
  "items": [
    {
      "name": "",
      "quantity": "",
      "price": ""
    }
  ]
}
`;

export { openai };