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
  items: Array<{
    name: string;
    quantity: string;
    price: string;
  }>;
}

async function extractImageData(file: File) {
  console.log("entered extractImageData");
  try {
    // Convert File to Blob and create File object for OpenAI
    const blob = new Blob([file], { type: file.type });

    // 1️⃣ Upload the file to OpenAI using the File object directly
    const uploadResponse = await client.files.create({
      file: file, // Use the File object directly
      purpose: "vision",
    });
    const fileId = uploadResponse.id;
    console.log("Uploaded file ID:", fileId);

    // 2️⃣ Use Chat Completions with Vision and the uploaded file
    const completionResponse = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: receiptExtractionPrompt
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract receipt information as JSON using the specified fields."
            },
            {
              type: "file", // Correct type for uploaded files
              file: {
                file_id: fileId // Use the uploaded file ID
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
    });

    // 3️⃣ Get the response text
    const rawContent = completionResponse.choices[0]?.message?.content || "";
    console.log("Raw extracted content:", rawContent);
  } catch (error) {
    console.error("Error extracting image data:", error);
    throw error;
  }
}

// async function extractImageData(file: File) {
//   console.log("entered extract image data");
//   try {
//     const arrayBuffer = await file.arrayBuffer();
//     const base64Image = Buffer.from(arrayBuffer).toString("base64");
//     const mimeType = file.type || "image/jpeg";

//     const completion = await client.chat.completions.create({
//       model: "gpt-4o",
//       messages: [
//         {
//           role: "system",
//           content: receiptExtractionPrompt,
//         },
//         {
//           role: "user",
//           content: [
//             {
//               type: "text",
//               text: "Extract structured receipt data from this image:",
//             },
//             {
//               type: "image_url",
//               image_url: `data:${mimeType};base64,${base64Image}`,
//             },
//           ],
//         },
//       ],
//     });

//     // Get the JSON text from the model
//     const rawContent = completion.choices[0].message?.content?.trim() || "";
//     console.log("Raw extracted content:", rawContent);

//     // Try parsing JSON safely
//     let extracted;
//     try {
//       extracted = JSON.parse(rawContent);
//     } catch {
//       console.warn("Response was not valid JSON. Returning raw text.");
//       extracted = { raw_text: rawContent };
//     }

//     return extracted;
//   } catch (error) {
//     console.error("Error getting chat completion:", error);
//     throw error;
//   }
// }

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

export { client, extractImageData };
