
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma } from "../db.server.js";

export async function loader({ request }: LoaderFunctionArgs) {
    
    const url = new URL(request.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    
    const receipts = await prisma.receipt.findMany({
        where: {
            userId: "550e8400-e29b-41d4-a716-446655440000",
            purchaseDate: {
                gte: from ? new Date(from) : undefined,
                lte: to ? new Date(to) : undefined,
            },
        },
        orderBy: { purchaseDate: "desc" },
    });
    
    return json(receipts);
}