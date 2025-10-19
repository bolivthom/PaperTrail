import { useState } from 'react';

import { ArrowUp, ArrowDown, Calendar } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';

interface SortDropdownProps {
  onSortChange: (sortType: string) => void;
}

export default function SortDropdown({ onSortChange }: SortDropdownProps) {
  const [selectedSort, setSelectedSort] = useState('Sort by');

  const handleSortChange = (type: string, label: string) => {
    setSelectedSort(label);
    onSortChange(type);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {selectedSort}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem onClick={() => handleSortChange('asc', 'Ascending')}>
          <ArrowUp className="mr-2 h-4 w-4" /> Ascending
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSortChange('desc', 'Descending')}>
          <ArrowDown className="mr-2 h-4 w-4" /> Descending
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSortChange('createdAt', 'Created At')}>
          <Calendar className="mr-2 h-4 w-4" /> Created At
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
