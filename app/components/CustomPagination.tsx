
import { useLocation, useSearchParams } from '@remix-run/react';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';

interface CustomPaginationProps {
  totalItems: number;
  itemsPerPage?: number;
  currentPage?: number;
  siblingCount?: number;
  className?: string;
}

export default function CustomPagination({
  totalItems,
  itemsPerPage = 10,
  currentPage: propCurrentPage,
  siblingCount = 2,
  className = "",
}: CustomPaginationProps) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Get current page from props or URL
  const currentPage = propCurrentPage || Number(searchParams.get('page')) || 1;
  
  // Calculate total pages
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Don't render pagination if only one page
  if (totalPages <= 1) {
    return null;
  }
  
  // Helper to build page URLs that preserve existing query params
  const getPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    return `${location.pathname}?${params.toString()}`;
  };
  
  // Calculate page range to display
  const getPageRange = () => {
    // Always show at least 5 pages if available
    const minVisiblePages = Math.min(5, totalPages);
    
    if (totalPages <= minVisiblePages) {
      // Show all pages if there are few
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Calculate range when there are many pages
    let startPage: number;
    
    if (currentPage <= siblingCount + 1) {
      // Near the start
      startPage = 1;
    } else if (currentPage >= totalPages - siblingCount) {
      // Near the end
      startPage = totalPages - minVisiblePages + 1;
    } else {
      // In the middle
      startPage = currentPage - siblingCount;
    }
    
    return Array.from({ length: minVisiblePages }, (_, i) => startPage + i);
  };
  
  return (
    <Pagination className={className}>
      <PaginationContent>
        {/* Previous Button */}
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious href={getPageUrl(currentPage - 1)} />
          </PaginationItem>
        )}
        
        {/* First Page (if not in current range) */}
        {totalPages > 5 && currentPage > siblingCount + 1 && (
          <>
            <PaginationItem>
              <PaginationLink href={getPageUrl(1)}>1</PaginationLink>
            </PaginationItem>
            {currentPage > siblingCount + 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
          </>
        )}
        
        {/* Page Numbers */}
        {getPageRange().map((pageNum) => (
          <PaginationItem key={pageNum}>
            <PaginationLink 
              href={getPageUrl(pageNum)}
              isActive={pageNum === currentPage}
            >
              {pageNum}
            </PaginationLink>
          </PaginationItem>
        ))}
        
        {/* Last Page (if not in current range) */}
        {totalPages > 5 && currentPage < totalPages - siblingCount && (
          <>
            {currentPage < totalPages - siblingCount - 1 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink href={getPageUrl(totalPages)}>
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}
        
        {/* Next Button */}
        {currentPage < totalPages && (
          <PaginationItem>
            <PaginationNext href={getPageUrl(currentPage + 1)} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}