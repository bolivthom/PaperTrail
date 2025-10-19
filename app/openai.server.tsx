import fs from "fs";
import OpenAI, { toFile } from "openai";
import { Readable } from "stream";

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
  category: string; // New field
  items: Array<{
    name: string;
    quantity: string;
    price: string;
  }>;
}

function cleanJsonResponse(rawContent: string): string {
  let cleaned = rawContent.trim();

  // Remove markdown code blocks
  cleaned = cleaned.replace(/^```json\s*/, "");
  cleaned = cleaned.replace(/^```\s*/, "");
  cleaned = cleaned.replace(/\s*```$/, "");

  // Remove any text before the first { and after the last }
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  return cleaned.trim();
}

async function extractImageData(s3Url: string): Promise<ReceiptDataExtract> {
  console.log("Starting receipt extraction from S3 URL:", s3Url);

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o", // Using GPT-4 Vision model
      messages: [
        {
          role: "system",
          content: receiptExtractionPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract structured receipt data from this image:",
            },
            {
              type: "image_url",
              image_url: {
                url: s3Url, // Direct S3 URL
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
    });

    const rawContent = completion.choices[0]?.message?.content?.trim() || "";
    console.log("Raw extracted content:", rawContent);

    const cleanedContent = cleanJsonResponse(rawContent);
    console.log("Cleaned content:", cleanedContent);

    let extracted: ReceiptDataExtract;
    try {
      extracted = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError);
      throw new Error("Failed to parse receipt data from AI response");
    }
    // Validate required fields
    if (!extracted.merchant_name && !extracted.total) {
      throw new Error("Insufficient data extracted from receipt");
    }

    return extracted;
  } catch (error) {
    console.error("Error in extractImageData:", error);
    throw error;
  }
}

const receiptExtractionPrompt = `You are an expert at extracting structured data from receipts and categorizing expenses. Given this image of a receipt, extract the following information in JSON format:
- totalAmount: The total amount paid.
- merchant_name: The name of the merchant.
- merchant_address: The address of the merchant.
- purchase_date: The date of purchase.
- sub_total: The subtotal amount before tax.
- tax_total: The total tax amount.
- total: The final total amount.
- currency: The currency used in the transaction.
- category: The expense category. Must be one of: Retail, Dining, Travel, Services, Financial, Entertainment, Utilities, Returns, Business, Government, Other
- items: A list of items purchased, each with:
  - name: The name of the item.
  - quantity: The quantity purchased.
  - price: The price of the item.

CATEGORY GUIDELINES:
- Retail: General merchandise stores, clothing, electronics, supermarkets, pharmacies
- Dining: Restaurants, cafes, fast food, bars, coffee shops
- Travel: Airlines, hotels, car rentals, taxis, public transportation
- Services: Repairs, consulting, professional services, subscriptions
- Financial: Bank fees, ATM withdrawals, investments, insurance
- Entertainment: Movies, concerts, sports events, streaming services
- Utilities: Electricity, water, internet, phone bills, gas
- Returns: Refunds, returns, credits
- Business: Office supplies, business expenses, work-related purchases
- Government: Taxes, fees, licenses, permits
- Other: Anything that doesn't fit the above categories

If any information is missing, use an empty string or an empty array as appropriate.

CRITICAL: Return ONLY valid JSON without any markdown formatting, code blocks, or additional text. Do not wrap the response in \`\`\`json or any other formatting.

Required JSON format:
{
  "totalAmount": "",
  "merchant_name": "",
  "merchant_address": "",
  "purchase_date": "",
  "sub_total": "",
  "tax_total": "",
  "total": "",
  "currency": "",
  "category": "",
  "items": [
    {
      "name": "",
      "quantity": "",
      "price": ""
    }
  ]
}

Be accurate and thorough in your extraction and categorization.`;

// const receiptExtractionPrompt = `You are an expert at extracting structured data from receipts. Given this image of a receipt, extract the following information in JSON format:
// - totalAmount: The total amount paid.
// - merchant_name: The name of the merchant.
// - merchant_address: The address of the merchant.
// - purchase_date: The date of purchase.
// - sub_total: The subtotal amount before tax.
// - tax_total: The total tax amount.
// - total: The final total amount.
// - currency: The currency used in the transaction.
// - items: A list of items purchased, each with:
//   - name: The name of the item.
//   - quantity: The quantity purchased.
//   - price: The price of the item.

// If any information is missing, use an empty string or an empty array as appropriate.

// CRITICAL: Return ONLY valid JSON without any markdown formatting, code blocks, or additional text. Do not wrap the response in \`\`\`json or any other formatting.

// Required JSON format:
// {
//   "totalAmount": "",
//   "merchant_name": "",
//   "merchant_address": "",
//   "purchase_date": "",
//   "sub_total": "",
//   "tax_total": "",
//   "total": "",
//   "currency": "",
//   "items": [
//     {
//       "name": "",
//       "quantity": "",
//       "price": ""
//     }
//   ]
// }

// Be accurate and thorough in your extraction.`;

// const receiptExtractionPrompt = `You are an expert at extracting structured data from receipts. Given this image of a receipt, extract the following information in JSON format:
// - totalAmount: The total amount paid.
// - merchant_name: The name of the merchant.
// - merchant_address: The address of the merchant.
// - purchase_date: The date of purchase.
// - sub_total: The subtotal amount before tax.
// - tax_total: The total tax amount.
// - total: The final total amount.
// - currency: The currency used in the transaction.
// - items: A list of items purchased, each with:
//   - name: The name of the item.
//   - quantity: The quantity purchased.
//   - price: The price of the item.

// If any information is missing, use an empty string or an empty array as appropriate.

// Please provide the extracted data in the following JSON format:
// {
//   "totalAmount": "",
//   "merchant_name": "",
//   "merchant_address": "",
//   "purchase_date": "",
//   "sub_total": "",
//   "tax_total": "",
//   "total": "",
//   "currency": "",
//   "items": [
//     {
//       "name": "",
//       "quantity": "",
//       "price": ""
//     }
//   ]
// }
// `;

export { client, extractImageData };
