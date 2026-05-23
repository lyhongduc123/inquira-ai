"use client";

import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { HStack } from "@/components/layout/hstack";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface BookmarkSearchFilters {
  isOpenAccess?: boolean;
  hasNotes?: boolean;
}

interface BookmarkSearchBarProps {
  value?: string;
  onSearch?: (query: string) => void;
  debounceMs?: number;
}

export function BookmarkSearchBar({
  value,
  onSearch,
  debounceMs = 300,
}: BookmarkSearchBarProps) {
  const [searchValue, setSearchValue] = useState(value || "");

  useEffect(() => {
    setSearchValue(value || "");
  }, [value]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch?.(searchValue);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [searchValue, debounceMs, onSearch]);

  return (
    <InputGroup className="w-full">
      <InputGroupInput
        id="bookmark-search-input"
        placeholder="Search bookmarks by title, authors, venue, or notes..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="select-none"
      />
      <InputGroupAddon align="inline-start">
        <SearchIcon className="text-muted-foreground" />
      </InputGroupAddon>
      {searchValue && (
      <InputGroupAddon align="inline-end">
        <Button variant="icon" size="icon-xs" onClick={() => setSearchValue("")}>
          <XIcon className="text-muted-foreground" />
        </Button>
      </InputGroupAddon>
      )}
    </InputGroup>
  );
}
