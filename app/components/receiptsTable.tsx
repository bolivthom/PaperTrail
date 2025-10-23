// import { useState } from "react";
// import { ArrowUpDown, MoreHorizontal, Eye, Trash2, Receipt } from "lucide-react";
// import { CategoryFilter } from "./CategoryFilter";
// import SortDropdown from "./SortButton";
// import { Searchbar } from "./searchbar";
// import { useSearchParams, Link } from "@remix-run/react";
// import { Button } from "./ui/button";
// import { CustomPagination } from "./CustomPagination";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
//   DropdownMenuSeparator,
// } from "./ui/dropdown-menu";
// import { EmptyState } from "./EmptyState";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "./ui/alert-dialog";

// interface ReceiptTableProps {
//   receipts: Array<{
//     id: string;
//     vendor: string;
//     totalAmount: string;
//     currency: string;
//     date: string;
//     category: string;
//     categoryId: string | null;
//   }>;
//   categories: Array<{ id: string; name: string }>;
//   totalCount: number;
//   currentPage: number;
//   itemsPerPage: number;
// }

// export default function ReceiptsTable({
//   receipts,
//   categories,
//   totalCount,
//   currentPage,
//   itemsPerPage,
// }: ReceiptTableProps) {
//   const [searchParams] = useSearchParams();
//   const [deletingId, setDeletingId] = useState<string | null>(null);
//   const [openDialog, setOpenDialog] = useState(false);
//   const [selectedReceipt, setSelectedReceipt] = useState<{ id: string; vendor: string } | null>(null);

//   const handleDelete = async (id: string) => {
//     if (!selectedReceipt) return;
//     setDeletingId(id);

//     try {
//       const response = await fetch(`/api/receipt/delete/${id}`, { method: "DELETE" });
//       if (response.ok) {
//         window.location.reload();
//       } else {
//         const body = await response.json();
//         alert(body.message || "Failed to delete receipt. Please try again.");
//       }
//     } catch (error) {
//       console.error("Delete error:", error);
//       alert("Network error. Please try again.");
//     } finally {
//       setDeletingId(null);
//       setOpenDialog(false);
//       setSelectedReceipt(null);
//     }
//   };

//   const formatDate = (dateString: string) =>
//     new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

//   const formatCurrency = (amount: string, currency: string) =>
//     `${currency} $${parseFloat(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

//   return (
//     <div className="w-full bg-background space-y-4">
//       {/* Filters Bar */}
//       <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
//         <Searchbar />
//         <CategoryFilter options={categories} />
//         <SortDropdown onSortChange={() => { }} />
//       </div>

//       {receipts.length === 0 ? (
//         <EmptyState
//           icon={Receipt}
//           title="No receipts found"
//           description="Try uploading your first receipt to get started."
//           actionLabel="Upload Receipt"
//           actionLink="/dashboard"
//           actionIcon={Receipt}
//         />
//       ) : (
//         <>
//           <div className="border border-border rounded-lg bg-card overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-muted/50">
//                   <tr className="border-b border-border">
//                     <th className="text-left p-4 font-medium text-sm text-muted-foreground">Vendor</th>
//                     <th className="text-left p-4 font-medium text-sm text-muted-foreground">Total Amount</th>
//                     <th className="text-left p-4 font-medium text-sm text-muted-foreground">Date</th>
//                     <th className="text-left p-4 font-medium text-sm text-muted-foreground">Category</th>
//                     <th className="text-right p-4 font-medium text-sm text-muted-foreground">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {receipts.map((receipt) => (
//                     <tr key={receipt.id} className="border-b border-border hover:bg-muted/50 transition-colors">
//                       <td className="p-4 text-sm font-medium">{receipt.vendor}</td>
//                       <td className="p-4 text-sm">{formatCurrency(receipt.totalAmount, receipt.currency)}</td>
//                       <td className="p-4 text-sm text-muted-foreground">{formatDate(receipt.date)}</td>
//                       <td className="p-4 text-sm">
//                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
//                           {receipt.category}
//                         </span>
//                       </td>
//                       <td className="p-4 text-sm text-right">
//                         <DropdownMenu>
//                           <DropdownMenuTrigger asChild>
//                             <Button variant="ghost" size="icon" className="h-8 w-8">
//                               <MoreHorizontal className="h-4 w-4" />
//                             </Button>
//                           </DropdownMenuTrigger>
//                           <DropdownMenuContent align="end">
//                             <DropdownMenuItem asChild>
//                               <Link to={`/dashboard/receipts/${receipt.id}`} className="flex items-center cursor-pointer">
//                                 <Eye className="mr-2 h-4 w-4" />
//                                 View Receipt
//                               </Link>
//                             </DropdownMenuItem>
//                             <DropdownMenuSeparator />
//                             <DropdownMenuItem
//                               className="text-destructive focus:text-destructive cursor-pointer"
//                               onClick={() => {
//                                 setSelectedReceipt({ id: receipt.id, vendor: receipt.vendor });
//                                 setOpenDialog(true);
//                               }}
//                             >
//                               <Trash2 className="mr-2 h-4 w-4" />
//                               Delete
//                             </DropdownMenuItem>
//                           </DropdownMenuContent>
//                         </DropdownMenu>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* Pagination */}
//           <CustomPagination totalItems={totalCount} itemsPerPage={itemsPerPage} currentPage={currentPage} className="mt-4" />

//           {/* ShadCN AlertDialog for deletion */}
//           {selectedReceipt && (
//             <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
//               <AlertDialogContent className="w-[90vw] max-w-md sm:max-w-lg md:max-w-xl rounded-lg">
//                 <AlertDialogHeader>
//                   <AlertDialogTitle>Delete Receipt</AlertDialogTitle>
//                   <AlertDialogDescription>
//                     Are you sure you want to delete the receipt from <strong>{selectedReceipt.vendor}</strong>? This action cannot be undone.
//                   </AlertDialogDescription>
//                 </AlertDialogHeader>
//                 <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
//                   <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
//                   <AlertDialogAction
//                     className="w-full sm:w-auto bg-destructive text-destructive-foreground"
//                     onClick={() => handleDelete(selectedReceipt.id)}
//                   >
//                     {deletingId === selectedReceipt.id ? "Deleting..." : "Delete"}
//                   </AlertDialogAction>
//                 </AlertDialogFooter>
//               </AlertDialogContent>
//             </AlertDialog>
//           )}

//         </>
//       )}
//     </div>
//   );
// }

// import { useState } from "react";
// import { MoreHorizontal, Eye, Trash2, Receipt } from "lucide-react";
// import { CategoryFilter } from "./CategoryFilter";
// import SortDropdown from "./SortButton";
// import { Searchbar } from "./searchbar";
// import { useSearchParams, Link } from "@remix-run/react";
// import { Button } from "./ui/button";
// import { CustomPagination } from "./CustomPagination";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
//   DropdownMenuSeparator,
// } from "./ui/dropdown-menu";
// import { EmptyState } from "./EmptyState";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "./ui/alert-dialog";
// import { Notification } from "~/components/notification";

// interface ReceiptTableProps {
//   receipts: Array<{
//     id: string;
//     vendor: string;
//     totalAmount: string;
//     currency: string;
//     date: string;
//     category: string;
//     categoryId: string | null;
//   }>;
//   categories: Array<{ id: string; name: string }>;
//   totalCount: number;
//   currentPage: number;
//   itemsPerPage: number;
// }

// export default function ReceiptsTable({
//   receipts,
//   categories,
//   totalCount,
//   currentPage,
//   itemsPerPage,
// }: ReceiptTableProps) {
//   const [searchParams] = useSearchParams();
//   const [deletingId, setDeletingId] = useState<string | null>(null);
//   const [openDialog, setOpenDialog] = useState(false);
//   const [selectedReceipt, setSelectedReceipt] = useState<{ id: string; vendor: string } | null>(null);
//   const [notification, setNotification] = useState<{
//     show: boolean;
//     message: string;
//     type: "success" | "error" | "info";
//   }>({
//     show: false,
//     message: "",
//     type: "success",
//   });

//   const showNotification = (message: string, type: "success" | "error" | "info" = "success") => {
//     setNotification({ show: true, message, type });
    
//     // Auto-hide after 5 seconds
//     setTimeout(() => {
//       setNotification((prev) => ({ ...prev, show: false }));
//     }, 5000);
//   };

//   const handleDelete = async (id: string) => {
//     if (!selectedReceipt) return;
//     setDeletingId(id);

//     try {
//       const response = await fetch(`/api/receipt/delete/${id}`, { method: "DELETE" });
//       if (response.ok) {
//         // Show success notification
//         showNotification(`Receipt from ${selectedReceipt.vendor} deleted successfully!`, "success");
        
//         // Reload after a short delay to show notification
//         setTimeout(() => {
//           window.location.reload();
//         }, 1500);
//       } else {
//         const body = await response.json();
//         showNotification(body.message || "Failed to delete receipt. Please try again.", "error");
//       }
//     } catch (error) {
//       console.error("Delete error:", error);
//       showNotification("Network error. Please try again.", "error");
//     } finally {
//       setDeletingId(null);
//       setOpenDialog(false);
//       setSelectedReceipt(null);
//     }
//   };

//   const formatDate = (dateString: string) =>
//     new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

//   const formatCurrency = (amount: string, currency: string) =>
//     `${currency} $${parseFloat(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

//   return (
//     <div className="w-full bg-background space-y-4">
//       {/* Notification */}
//       {notification.show && (
//         <Notification
//           message={notification.message}
//           type={notification.type}
//           onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
//         />
//       )}

//       {/* Filters Bar */}
//       <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
//         <Searchbar />
//         <CategoryFilter options={categories} />
//         <SortDropdown onSortChange={() => {}} />
//       </div>

//       {receipts.length === 0 ? (
//         <EmptyState
//           icon={Receipt}
//           title="No receipts found"
//           description="Try uploading your first receipt to get started."
//           actionLabel="Upload Receipt"
//           actionLink="/dashboard"
//           actionIcon={Receipt}
//         />
//       ) : (
//         <>
//           <div className="border border-border rounded-lg bg-card overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-muted/50">
//                   <tr className="border-b border-border">
//                     <th className="text-left p-4 font-medium text-sm text-muted-foreground whitespace-nowrap">Vendor</th>
//                     <th className="text-left p-4 font-medium text-sm text-muted-foreground whitespace-nowrap">Total Amount</th>
//                     <th className="text-left p-4 font-medium text-sm text-muted-foreground whitespace-nowrap">Date</th>
//                     <th className="text-left p-4 font-medium text-sm text-muted-foreground whitespace-nowrap">Category</th>
//                     <th className="text-right p-4 font-medium text-sm text-muted-foreground whitespace-nowrap">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {receipts.map((receipt) => (
//                     <tr key={receipt.id} className="border-b border-border hover:bg-muted/50 transition-colors">
//                       <td className="p-4 text-sm font-medium whitespace-nowrap">{receipt.vendor}</td>
//                       <td className="p-4 text-sm whitespace-nowrap">{formatCurrency(receipt.totalAmount, receipt.currency)}</td>
//                       <td className="p-4 text-sm text-muted-foreground whitespace-nowrap">{formatDate(receipt.date)}</td>
//                       <td className="p-4 text-sm whitespace-nowrap">
//                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
//                           {receipt.category}
//                         </span>
//                       </td>
//                       <td className="p-4 text-sm text-right whitespace-nowrap">
//                         <DropdownMenu>
//                           <DropdownMenuTrigger asChild>
//                             <Button variant="ghost" size="icon" className="h-8 w-8" disabled={deletingId === receipt.id}>
//                               <MoreHorizontal className="h-4 w-4" />
//                             </Button>
//                           </DropdownMenuTrigger>
//                           <DropdownMenuContent align="end">
//                             <DropdownMenuItem asChild>
//                               <Link to={`/dashboard/receipts/${receipt.id}`} className="flex items-center cursor-pointer">
//                                 <Eye className="mr-2 h-4 w-4" />
//                                 View Receipt
//                               </Link>
//                             </DropdownMenuItem>
//                             <DropdownMenuSeparator />
//                             <DropdownMenuItem
//                               className="text-destructive focus:text-destructive cursor-pointer"
//                               onClick={() => {
//                                 setSelectedReceipt({ id: receipt.id, vendor: receipt.vendor });
//                                 setOpenDialog(true);
//                               }}
//                               disabled={deletingId === receipt.id}
//                             >
//                               <Trash2 className="mr-2 h-4 w-4" />
//                               Delete
//                             </DropdownMenuItem>
//                           </DropdownMenuContent>
//                         </DropdownMenu>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* Pagination */}
//           <CustomPagination totalItems={totalCount} itemsPerPage={itemsPerPage} currentPage={currentPage} className="mt-4" />

//           {/* Delete Confirmation Dialog */}
//           {selectedReceipt && (
//             <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
//               <AlertDialogContent className="w-[90vw] max-w-md sm:max-w-lg md:max-w-xl rounded-lg">
//                 <AlertDialogHeader>
//                   <AlertDialogTitle>Delete Receipt</AlertDialogTitle>
//                   <AlertDialogDescription>
//                     Are you sure you want to delete the receipt from <strong>{selectedReceipt.vendor}</strong>? This action cannot be undone.
//                   </AlertDialogDescription>
//                 </AlertDialogHeader>
//                 <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
//                   <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
//                   <AlertDialogAction
//                     className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
//                     onClick={() => handleDelete(selectedReceipt.id)}
//                     disabled={deletingId === selectedReceipt.id}
//                   >
//                     {deletingId === selectedReceipt.id ? "Deleting..." : "Delete"}
//                   </AlertDialogAction>
//                 </AlertDialogFooter>
//               </AlertDialogContent>
//             </AlertDialog>
//           )}
//         </>
//       )}
//     </div>
//   );
// }

import { useState } from "react";
import { MoreHorizontal, Eye, Trash2, Receipt } from "lucide-react";
import { CategoryFilter } from "./CategoryFilter";
import SortDropdown from "./SortButton";
import { Searchbar } from "./searchbar";
import { useSearchParams, Link } from "@remix-run/react";
import { Button } from "./ui/button";
import { CustomPagination } from "./CustomPagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { EmptyState } from "./EmptyState";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Notification } from "~/components/Notification";

interface ReceiptTableProps {
  receipts: Array<{
    id: string;
    vendor: string;
    totalAmount: string;
    currency: string;
    date: string;
    category: string;
    categoryId: string | null;
  }>;
  categories: Array<{ id: string; name: string }>;
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
}

export default function ReceiptsTable({
  receipts,
  categories,
  totalCount,
  currentPage,
  itemsPerPage,
}: ReceiptTableProps) {
  const [searchParams] = useSearchParams();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<{ id: string; vendor: string } | null>(null);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const showNotification = (message: string, type: "success" | "error" | "info" = "success") => {
    setNotification({ show: true, message, type });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 5000);
  };

  const handleDelete = async (id: string) => {
    if (!selectedReceipt) return;
    setDeletingId(id);

    try {
      const response = await fetch(`/api/receipt/delete/${id}`, { method: "DELETE" });
      if (response.ok) {
        showNotification(`Receipt from ${selectedReceipt.vendor} deleted successfully!`, "success");
        
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        const body = await response.json();
        showNotification(body.message || "Failed to delete receipt. Please try again.", "error");
      }
    } catch (error) {
      console.error("Delete error:", error);
      showNotification("Network error. Please try again.", "error");
    } finally {
      setDeletingId(null);
      setOpenDialog(false);
      setSelectedReceipt(null);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const formatCurrency = (amount: string, currency: string) =>
    `${currency} $${parseFloat(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="w-full bg-background space-y-4">
      {/* Notification - Mobile optimized */}
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
        />
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <Searchbar />
        <CategoryFilter options={categories} />
        <SortDropdown onSortChange={() => {}} />
      </div>

      {receipts.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No receipts found"
          description="Try uploading your first receipt to get started."
          actionLabel="Upload Receipt"
          actionLink="/dashboard"
          actionIcon={Receipt}
        />
      ) : (
        <>
          {/* Desktop Table View - Hidden on mobile */}
          <div className="hidden md:block border border-border rounded-lg bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground whitespace-nowrap">Vendor</th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground whitespace-nowrap">Total Amount</th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground whitespace-nowrap">Date</th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground whitespace-nowrap">Category</th>
                    <th className="text-right p-4 font-medium text-sm text-muted-foreground whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.map((receipt) => (
                    <tr key={receipt.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="p-4 text-sm font-medium whitespace-nowrap">{receipt.vendor}</td>
                      <td className="p-4 text-sm whitespace-nowrap">{formatCurrency(receipt.totalAmount, receipt.currency)}</td>
                      <td className="p-4 text-sm text-muted-foreground whitespace-nowrap">{formatDate(receipt.date)}</td>
                      <td className="p-4 text-sm whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {receipt.category}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-right whitespace-nowrap">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={deletingId === receipt.id}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/dashboard/receipts/${receipt.id}`} className="flex items-center cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                View Receipt
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive cursor-pointer"
                              onClick={() => {
                                setSelectedReceipt({ id: receipt.id, vendor: receipt.vendor });
                                setOpenDialog(true);
                              }}
                              disabled={deletingId === receipt.id}
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

          {/* Mobile Card View - Visible only on mobile */}
          <div className="md:hidden space-y-3">
            {receipts.map((receipt) => (
              <div
                key={receipt.id}
                className="border border-border rounded-lg bg-card p-4 space-y-3"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-base truncate">{receipt.vendor}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{formatDate(receipt.date)}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 -mr-2" 
                        disabled={deletingId === receipt.id}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/dashboard/receipts/${receipt.id}`} className="flex items-center cursor-pointer">
                          <Eye className="mr-2 h-4 w-4" />
                          View Receipt
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onClick={() => {
                          setSelectedReceipt({ id: receipt.id, vendor: receipt.vendor });
                          setOpenDialog(true);
                        }}
                        disabled={deletingId === receipt.id}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Amount and Category Row */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Amount</p>
                    <p className="text-lg font-semibold">{formatCurrency(receipt.totalAmount, receipt.currency)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">Category</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {receipt.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <CustomPagination totalItems={totalCount} itemsPerPage={itemsPerPage} currentPage={currentPage} className="mt-4" />

          {/* Delete Confirmation Dialog - Mobile optimized */}
          {selectedReceipt && (
            <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
              <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md rounded-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Receipt</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete the receipt from <strong>{selectedReceipt.vendor}</strong>? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                  <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => handleDelete(selectedReceipt.id)}
                    disabled={deletingId === selectedReceipt.id}
                  >
                    {deletingId === selectedReceipt.id ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </>
      )}
    </div>
  );
}