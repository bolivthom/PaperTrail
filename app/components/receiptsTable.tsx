// import { ArrowUpDown, MoreHorizontal, Eye, Trash2 } from "lucide-react";
// import { CategoryFilter } from "./CategoryFilter";
// import SortDropdown from "./SortButton";
// import { Searchbar } from "./searchbar";
// import { useSearchParams, Link } from "@remix-run/react";
// import { Button } from "./ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
//   DropdownMenuSeparator,
// } from "./ui/dropdown-menu";
// import { CustomPagination } from "./customPagination";

// // Sample data
// const allReceipts = [
//   { id: 1, vendor: 'Table item title', totalAmount: 'Table item title', date: 'Table item title', merchant: 'Table item title', category: 'Table item title' },
//   { id: 2, vendor: 'Table item title', totalAmount: 'Table item title', date: 'Table item title', merchant: 'Table item title', category: 'Table item title' },
//   { id: 3, vendor: 'Table item title', totalAmount: 'Table item title', date: 'Table item title', merchant: 'Table item title', category: 'Table item title' },
//   { id: 4, vendor: 'Table item title', totalAmount: 'Table item title', date: 'Table item title', merchant: 'Table item title', category: 'Table item title' },
//   { id: 5, vendor: 'Table item title', totalAmount: 'Table item title', date: 'Table item title', merchant: 'Table item title', category: 'Table item title' },
//   { id: 6, vendor: 'Table item title', totalAmount: 'Table item title', date: 'Table item title', merchant: 'Table item title', category: 'Table item title' },
//   { id: 7, vendor: 'Table item title', totalAmount: 'Table item title', date: 'Table item title', merchant: 'Table item title', category: 'Table item title' },
//   { id: 8, vendor: 'Table item title', totalAmount: 'Table item title', date: 'Table item title', merchant: 'Table item title', category: 'Table item title' },
// ];

// export default function ReceiptsTable() {
//   const [searchParams] = useSearchParams();

//   const searchQuery = searchParams.get('q') || '';
//   const filterStatus = searchParams.get('status') || 'all';
//   const currentPage = Number(searchParams.get('page')) || 1;
//   const ITEMS_PER_PAGE = 10;

//   // Get current page items
//   const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
//   const endIndex = startIndex + ITEMS_PER_PAGE;
//   const currentReceipts = allReceipts.slice(startIndex, endIndex);

//   const handleDelete = (id: number) => {
//     // Add delete logic here
//     console.log('Delete receipt:', id);
//   };

//   return (
//     <div className="min-h-screen w-full bg-background space-y-4">
//       {/* Filters Bar */}
//       <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
//         {/* Search Input */}
//         <Searchbar />

//         {/* Category Select */}
//         <CategoryFilter options={[]} />

//         {/* Sort Select */}
//         <SortDropdown onSortChange={() => { }} />
//       </div>

//       {/* Table */}
//       <div className="border border-border rounded-lg bg-card overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-muted/50">
//               <tr className="border-b border-border">
//                 <th className="text-left p-4 font-medium text-sm">
//                   <button className="flex items-center gap-2 hover:text-foreground">
//                     Vendor
//                     <ArrowUpDown className="w-4 h-4" />
//                   </button>
//                 </th>
//                 <th className="text-left p-4 font-medium text-sm">
//                   <button className="flex items-center gap-2 hover:text-foreground">
//                     Total Amount
//                     <ArrowUpDown className="w-4 h-4" />
//                   </button>
//                 </th>
//                 <th className="text-left p-4 font-medium text-sm">
//                   <button className="flex items-center gap-2 hover:text-foreground">
//                     Date
//                     <ArrowUpDown className="w-4 h-4" />
//                   </button>
//                 </th>
//                 <th className="text-left p-4 font-medium text-sm">
//                   <button className="flex items-center gap-2 hover:text-foreground">
//                     Merchant
//                     <ArrowUpDown className="w-4 h-4" />
//                   </button>
//                 </th>
//                 <th className="text-left p-4 font-medium text-sm">
//                   <button className="flex items-center gap-2 hover:text-foreground">
//                     Category
//                     <ArrowUpDown className="w-4 h-4" />
//                   </button>
//                 </th>
//                 <th className="text-right p-4 font-medium text-sm">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentReceipts.map((receipt) => (
//                 <tr
//                   key={receipt.id}
//                   className="border-b border-border hover:bg-muted/50 transition-colors"
//                 >
//                   <td className="p-4 text-sm">{receipt.vendor}</td>
//                   <td className="p-4 text-sm">{receipt.totalAmount}</td>
//                   <td className="p-4 text-sm">{receipt.date}</td>
//                   <td className="p-4 text-sm">{receipt.merchant}</td>
//                   <td className="p-4 text-sm">{receipt.category}</td>
//                   <td className="p-4 text-sm text-right">
//                     <DropdownMenu>
//                       <DropdownMenuTrigger asChild>
//                         <Button variant="ghost" size="icon" className="h-8 w-8">
//                           <MoreHorizontal className="h-4 w-4" />
//                         </Button>
//                       </DropdownMenuTrigger>
//                       <DropdownMenuContent align="end">
//                         <DropdownMenuItem asChild>
//                           <Link 
//                             to={`/dashboard/receipts/1`}
//                             className="flex items-center cursor-pointer"
//                           >
//                             <Eye className="mr-2 h-4 w-4" />
//                             View Receipt
//                           </Link>
//                         </DropdownMenuItem>
//                         <DropdownMenuSeparator />
//                         <DropdownMenuItem 
//                           onClick={() => handleDelete(receipt.id)}
//                           className="text-destructive focus:text-destructive cursor-pointer"
//                         >
//                           <Trash2 className="mr-2 h-4 w-4" />
//                           Delete
//                         </DropdownMenuItem>
//                       </DropdownMenuContent>
//                     </DropdownMenu>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Pagination */}
//       {allReceipts.length > 0 && (
//         <CustomPagination
//           totalItems={allReceipts.length}
//           itemsPerPage={ITEMS_PER_PAGE}
//           currentPage={currentPage}
//           className="mt-4"
//         />
//       )}
//     </div>
//   );
// }

import { ArrowUpDown, MoreHorizontal, Eye, Trash2, Receipt } from "lucide-react";
import { CategoryFilter } from "./CategoryFilter";
import SortDropdown from "./SortButton";
import { Searchbar } from "./searchbar";
import { useSearchParams, Link } from "@remix-run/react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { CustomPagination } from "./customPagination";
import { EmptyState } from "./EmptyState";

// Sample data
const allReceipts = [
  { id: 1, vendor: 'Table item title', totalAmount: 'Table item title', date: 'Table item title', merchant: 'Table item title', category: 'Table item title' },
  { id: 2, vendor: 'Table item title', totalAmount: 'Table item title', date: 'Table item title', merchant: 'Table item title', category: 'Table item title' },
  { id: 3, vendor: 'Table item title', totalAmount: 'Table item title', date: 'Table item title', merchant: 'Table item title', category: 'Table item title' },
  { id: 4, vendor: 'Table item title', totalAmount: 'Table item title', date: 'Table item title', merchant: 'Table item title', category: 'Table item title' },
  { id: 5, vendor: 'Table item title', totalAmount: 'Table item title', date: 'Table item title', merchant: 'Table item title', category: 'Table item title' },
  { id: 6, vendor: 'Table item title', totalAmount: 'Table item title', date: 'Table item title', merchant: 'Table item title', category: 'Table item title' },
  { id: 7, vendor: 'Table item title', totalAmount: 'Table item title', date: 'Table item title', merchant: 'Table item title', category: 'Table item title' },
  { id: 8, vendor: 'Table item title', totalAmount: 'Table item title', date: 'Table item title', merchant: 'Table item title', category: 'Table item title' },
];

export default function ReceiptsTable() {
  const [searchParams] = useSearchParams();

  const searchQuery = searchParams.get('q') || '';
  const filterStatus = searchParams.get('status') || 'all';
  const currentPage = Number(searchParams.get('page')) || 1;
  const ITEMS_PER_PAGE = 10;

  // Get current page items
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentReceipts = allReceipts.slice(startIndex, endIndex);

  const handleDelete = (id: number) => {
    // Add delete logic here
    console.log('Delete receipt:', id);
  };

  return (
    <div className="min-h-screen w-full bg-background space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search Input */}
        <Searchbar />

        {/* Category Select */}
        <CategoryFilter options={[]} />

        {/* Sort Select */}
        <SortDropdown onSortChange={() => { }} />
      </div>

      {/* Table or Empty State */}
      {allReceipts.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No receipts yet"
          description="Upload your first receipt to get started with expense tracking and organization."
          actionLabel="Upload Receipt"
          actionLink="/dashboard"
          actionIcon={Receipt}
        />
      ) : (
        <>
          {/* Table */}
          <div className="border border-border rounded-lg bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium text-sm">
                      <button className="flex items-center gap-2 hover:text-foreground">
                        Vendor
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      <button className="flex items-center gap-2 hover:text-foreground">
                        Total Amount
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      <button className="flex items-center gap-2 hover:text-foreground">
                        Date
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      <button className="flex items-center gap-2 hover:text-foreground">
                        Merchant
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="text-left p-4 font-medium text-sm">
                      <button className="flex items-center gap-2 hover:text-foreground">
                        Category
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="text-right p-4 font-medium text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentReceipts.map((receipt) => (
                    <tr
                      key={receipt.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-4 text-sm">{receipt.vendor}</td>
                      <td className="p-4 text-sm">{receipt.totalAmount}</td>
                      <td className="p-4 text-sm">{receipt.date}</td>
                      <td className="p-4 text-sm">{receipt.merchant}</td>
                      <td className="p-4 text-sm">{receipt.category}</td>
                      <td className="p-4 text-sm text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link 
                                to={`/dashboard/receipts/${receipt.id}`}
                                className="flex items-center cursor-pointer"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Receipt
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(receipt.id)}
                              className="text-destructive focus:text-destructive cursor-pointer"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <CustomPagination
            totalItems={allReceipts.length}
            itemsPerPage={ITEMS_PER_PAGE}
            currentPage={currentPage}
            className="mt-4"
          />
        </>
      )}
    </div>
  );
}