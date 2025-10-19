import { useState } from 'react';

import { ArrowUp, ArrowDown, Calendar } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';
import { useNavigate, useSearchParams } from '@remix-run/react';

interface SortDropdownProps {
  onSortChange: (sortType: string) => void;
}

export default function SortDropdown({ onSortChange }: SortDropdownProps) {
  const [selectedSort, setSelectedSort] = useState('Sort by');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const handleSortChange = (type: string, label: string) => {
    setSelectedSort(label);
    onSortChange(type);
    const params = new URLSearchParams(searchParams);
    params.set('sort', type);
    params.set('page', '1');
    
    navigate(`?${params.toString()}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {selectedSort}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem onClick={() => handleSortChange('amount-asc', 'Ascending')}>
          <ArrowUp className="mr-2 h-4 w-4" /> Ascending
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSortChange('amount-desc', 'Descending')}>
          <ArrowDown className="mr-2 h-4 w-4" /> Descending
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSortChange('date-desc', 'Newest')}>
          <Calendar className="mr-2 h-4 w-4" /> Newest
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSortChange('date-asc', 'Oldest')}>
          <Calendar className="mr-2 h-4 w-4" /> Oldest
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
