"use client";

import { useState, useEffect } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SearchIcon } from "lucide-react";

interface BookmarkSearchBarProps {
  onSearch?: (query: string) => void;
  debounceMs?: number;
}

export function BookmarkSearchBar({
  onSearch,
  debounceMs = 300,
}: BookmarkSearchBarProps) {
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch?.(searchValue);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [searchValue, debounceMs, onSearch]);

  return (
    <InputGroup className="w-full">
      <InputGroupInput
        id="inline-start-input"
        placeholder="Search bookmarks by title, authors, or venue..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />
      <InputGroupAddon align="inline-start">
        <SearchIcon className="text-muted-foreground" />
      </InputGroupAddon>
    </InputGroup>
  );
}
