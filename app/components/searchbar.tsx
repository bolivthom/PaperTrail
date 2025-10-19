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
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Handle search submission to your specific endpoint
  const handleSubmit = (term: string) => {
    if (term.trim()) {
      // Navigate to your specific endpoint with the search parameter
      navigate(`/api/receipts?sort=asc&search=${encodeURIComponent(term)}`);
    }
  };

  // Your existing debounced search handler (keeping it for compatibility)
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Clear any pending debounced search
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Submit to your specific endpoint
      const value = e.currentTarget.value;
      handleSubmit(value);
    }
  };

  return (
    <div className="relative w-screen sm:w-full sm:max-w-full -mx-4 px-4 sm:mx-0 sm:px-0">
      <Input
        ref={inputRef}
        type="search"
        placeholder={placeholder}
        defaultValue={defaultValue || searchParams.get('q') || ''}
        className={`pl-4 pr-4 ${className}`}
        onChange={(e) => {
          // Clear previous timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          
          // Only search if user pauses typing for 300ms (debounce) - your existing functionality
          timeoutRef.current = setTimeout(() => {
            handleSearch(e.target.value);
          }, 300);
        }}
        onKeyPress={handleKeyPress}
      />
    </div>
  );
}