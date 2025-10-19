import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { AppSidebar } from "~/components/app-sidebar";
import { SidebarProvider } from "~/components/ui/sidebar";
import { getUserFromRequest } from "~/lib/user";
import prisma from "~/prisma.server";
import { Header } from "~/components/header";
import ReceiptsTable from "~/components/receiptsTable";
// import ReceiptsTable from "~/components/receiptsTable";


// In dashboard.receipts.tsx loader
export async function loader({ request }: LoaderFunctionArgs) {
  const { user } = await getUserFromRequest(request);
  console.log('User in receipts loader:', user);
  if (!user) return redirect('/auth/login');

  const url = new URL(request.url);
  const searchQuery = url.searchParams.get('q') || '';
  
  // Handle both single category and multiple categories
  const categoryParam = url.searchParams.get('categories') || url.searchParams.get('category') || '';
  const categoryFilters = categoryParam ? categoryParam.split(',').filter(Boolean) : [];
  
  const sortBy = url.searchParams.get('sort') || 'date-desc';
  const currentPage = Number(url.searchParams.get('page')) || 1;
  const ITEMS_PER_PAGE = 10;

  // Build where clause
  const whereClause: any = {
    user_id: user.id,
  };

  // Add search filter
  if (searchQuery) {
    whereClause.OR = [
      { company_name: { contains: searchQuery, mode: 'insensitive' } },
      { notes: { contains: searchQuery, mode: 'insensitive' } },
    ];
  }

  // Add category filter (supports multiple categories)
  if (categoryFilters.length > 0 && !categoryFilters.includes('all')) {
    whereClause.category_id = { in: categoryFilters };
  }

  // ... rest of loader code
// }

// export async function loader({ request }: LoaderFunctionArgs) {
//   const { user } = await getUserFromRequest(request);
  
//   if (!user) return redirect('/auth/login');

//   const url = new URL(request.url);
//   const searchQuery = url.searchParams.get('q') || '';
//   const categoryFilter = url.searchParams.get('category') || 'all';
//   const sortBy = url.searchParams.get('sort') || 'date-desc';
//   const currentPage = Number(url.searchParams.get('page')) || 1;
//   const ITEMS_PER_PAGE = 10;

//   // Build where clause
//   const whereClause: any = {
//     user_id: user.id,
//   };

//   // Add search filter
//   if (searchQuery) {
//     whereClause.OR = [
//       { company_name: { contains: searchQuery, mode: 'insensitive' } },
//       { notes: { contains: searchQuery, mode: 'insensitive' } },
//     ];
//   }

//   // Add category filter
//   if (categoryFilter && categoryFilter !== 'all') {
//     whereClause.category_id = categoryFilter;
//   }

  // Build orderBy
  let orderBy: any = {};
  switch (sortBy) {
    case 'date-desc':
      orderBy = { purchase_date: 'desc' };
      break;
    case 'date-asc':
      orderBy = { purchase_date: 'asc' };
      break;
    case 'amount-desc':
      orderBy = { total_amount: 'desc' };
      break;
    case 'amount-asc':
      orderBy = { total_amount: 'asc' };
      break;
    case 'vendor-asc':
      orderBy = { company_name: 'asc' };
      break;
    case 'vendor-desc':
      orderBy = { company_name: 'desc' };
      break;
    default:
      orderBy = { purchase_date: 'desc' };
  }

  // Get total count for pagination
  const totalCount = await prisma.receipt.count({ where: whereClause });

  console.log('WHERE', whereClause)
  // Fetch receipts with pagination
  const receipts = await prisma.receipt.findMany({
    where: whereClause,
    orderBy,
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Fetch all categories for filter
  const categories = await prisma.category.findMany({
    where: { user_id: user.id },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return json({
    receipts: receipts.map(receipt => ({
      id: receipt.id,
      vendor: receipt.company_name,
      totalAmount: receipt.total_amount.toString(),
      currency: receipt.currency,
      date: receipt.purchase_date.toISOString(),
      category: receipt.category?.name || 'Uncategorized',
      categoryId: receipt.category_id,
    })),
    categories,
    totalCount,
    currentPage,
    itemsPerPage: ITEMS_PER_PAGE,
  });
}

export default function ReceiptsPage() {
  const { receipts, categories, totalCount, currentPage, itemsPerPage } = useLoaderData<typeof loader>();

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-background">
          <ReceiptsTable 
            receipts={receipts}
            categories={categories}
            totalCount={totalCount}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
          />
      </div>
    </SidebarProvider>
  );
}