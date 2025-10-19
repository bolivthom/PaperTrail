
import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
    
    const url = new URL(request.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    // insert prisma db call here, query for all reciepts by currently logged in user
    // with created_at between "from" and "to" (Optional)

    const response = getMockReceipt();
    
    return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        }
    });
    
}

export function getMockReceipt() {
  return {
    state: "ok",
    message: "list of receipts for user: Andrew",
    data: [
      {
        id: "7a5b6e9d-3c2f-4e61-84aa-82a493f3b47e",
        user_id: "9b4c1a30-2b6a-4f35-a84e-12dfe2a812b4",
        company_name: "MegaMart Supercenter",
        company_address: "12 Constant Spring Rd, Kingston, Jamaica",
        purchase_date: "2025-10-16",
        sub_total: 4200.0,
        tax_amount: 630.0,
        total_amount: 4830.0,
        currency: "JMD",
        notes: "Weekly grocery run. Included 2 items on sale.",
        image_data: null,
        image_mime_type: "image/jpeg",
        image_filename: "receipt_2025-10-16.jpg",
        image_url: "https://cdn.yourapp.com/receipts/receipt_2025-10-16.jpg",
        created_at: "2025-10-16T20:42:13.812Z",
        updated_at: "2025-10-16T20:42:13.812Z",
      },
      {
        id: "b6c8c321-f82b-41f4-8ab3-92f3e6d95f0d",
        user_id: "9b4c1a30-2b6a-4f35-a84e-12dfe2a812b4",
        company_name: "Fontana Pharmacy",
        company_address: "91-93 Red Hills Rd, Kingston, Jamaica",
        purchase_date: "2025-10-10",
        sub_total: 2800.0,
        tax_amount: 420.0,
        total_amount: 3220.0,
        currency: "JMD",
        notes: "Purchased vitamins and hand sanitizer.",
        image_data: null,
        image_mime_type: "image/jpeg",
        image_filename: "receipt_2025-10-10.jpg",
        image_url: "https://cdn.yourapp.com/receipts/receipt_2025-10-10.jpg",
        created_at: "2025-10-10T18:30:45.123Z",
        updated_at: "2025-10-10T18:30:45.123Z",
      },
      {
        id: "d73e2a1f-4bc2-4c7e-9218-1a5c42007b5c",
        user_id: "9b4c1a30-2b6a-4f35-a84e-12dfe2a812b4",
        company_name: "Total Gas Station",
        company_address: "Half Way Tree Rd, Kingston, Jamaica",
        purchase_date: "2025-10-08",
        sub_total: 6000.0,
        tax_amount: 900.0,
        total_amount: 6900.0,
        currency: "JMD",
        notes: "Filled up the car. Included car wash.",
        image_data: null,
        image_mime_type: "image/jpeg",
        image_filename: "receipt_2025-10-08.jpg",
        image_url: "https://cdn.yourapp.com/receipts/receipt_2025-10-08.jpg",
        created_at: "2025-10-08T12:20:30.456Z",
        updated_at: "2025-10-08T12:20:30.456Z",
      }
    ]
  };
}