"use client";

import { useEffect, useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SearchIcon } from "lucide-react";

interface ConversationSearchBarProps {
  onSearch?: (query: string) => void;
  debounceMs?: number;
}

export function ConversationSearchBar({
  onSearch,
  debounceMs = 300,
}: ConversationSearchBarProps) {
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
        placeholder="Search conversations by title or message content..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />
      <InputGroupAddon align="inline-start">
        <SearchIcon className="text-muted-foreground" />
      </InputGroupAddon>
    </InputGroup>
  );
}
