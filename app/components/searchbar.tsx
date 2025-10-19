import { useEffect, useRef } from 'react';
import { Input } from "~/components/ui/input";
import { Search } from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from '@remix-run/react';

interface SearchInputProps {
  placeholder?: string;
  defaultValue?: string;
  className?: string;
  preserveParams?: string[];
}

export function Searchbar({ 
  placeholder = "Search...", 
  defaultValue = "",
  className = "",
  preserveParams = []
}: SearchInputProps) {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Handle search submission
  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    
    // Reset to first page when searching
    params.delete('page');
    
    navigate(`${location.pathname}?${params.toString()}`, {
      replace: true,
    });
  };

  return (
    <div className="relative w-screen sm:w-full sm:max-w-full -mx-4 px-4 sm:mx-0 sm:px-0">
      <Input
        type="search"
        placeholder={placeholder}
        defaultValue={defaultValue || searchParams.get('q') || ''}
        className={`pl-4 pr-4 ${className}`}
        onChange={(e) => {
          // Clear previous timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          
          // Only search if user pauses typing for 300ms (debounce)
          timeoutRef.current = setTimeout(() => {
            handleSearch(e.target.value);
          }, 300);
        }}
      />
    </div>
  );
}