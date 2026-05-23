"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { VStack } from "@/components/layout/vstack";
import { HStack } from "@/components/layout/hstack";
import { Box } from "@/components/layout/box";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TypographyP } from "@/components/global/typography";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSearchFilters } from "@/hooks/use-search-filters";
import { ChatSubmitFilters } from "@/types/task.type";

export type SearchFilters = Omit<ChatSubmitFilters, "journalQuartile"> & {
  journalQuartile?: "Q1" | "Q2" | "Q3" | "Q4";
};

export function FilterPanel({ open, onOpenChange }: FilterPanelProps) {
  const { filters, setParams } = useSearchFilters();
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  const hasActiveFilters = Object.values(localFilters).some((value) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== undefined && value !== "";
  });

  function updateFilter<K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K] | undefined,
  ) {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function updateYearRange(yearRange: { min?: number; max?: number }) {
    setLocalFilters((prev) => ({
      ...prev,
      yearMin: yearRange.min,
      yearMax: yearRange.max,
    }));
  }

  function updateCategory(value: string[]) {
    setLocalFilters((prev) => ({
      ...prev,
      fieldOfStudy: value.length > 0 ? value : undefined,
    }));
  }

  function updateJournalQuartile(value: "Q1" | "Q2" | "Q3" | "Q4" | undefined) {
    setLocalFilters((prev) => ({
      ...prev,
      journalQuartile: value,
    }));
  }

  function handleApply() {
    setParams(localFilters);
    onOpenChange(false);
  }

  function handleClear() {
    const clearedFilters: SearchFilters = {};
    setLocalFilters(clearedFilters);
    setParams(clearedFilters);
  }

  function handleCancel() {
    setLocalFilters(filters);
    onOpenChange(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setLocalFilters(filters);
    }
    onOpenChange(nextOpen);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex h-full flex-col gap-1"
      >
        <SheetHeader className="">
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0">
          <VStack className="gap-6 px-4">
            <HStack className="items-start gap-4">
              <Box className="flex-1">
                <YearFilter
                  yearRange={{
                    min: localFilters.yearMin,
                    max: localFilters.yearMax,
                  }}
                  onYearRangeChange={updateYearRange}
                />
              </Box>
            </HStack>

            <Separator />

            <CitationFilter
              minCitationCount={localFilters.minCitationCount}
              maxCitationCount={localFilters.maxCitationCount}
              onMinCitationCountChange={(value) =>
                updateFilter("minCitationCount", value)
              }
              onMaxCitationCountChange={(value) =>
                updateFilter("maxCitationCount", value)
              }
            />

            <Separator />

            <JournalFilter
              journalQuartile={localFilters.journalQuartile}
              onJournalQuartileChange={updateJournalQuartile}
            />

            <CategoryFilter
              category={localFilters.fieldOfStudy}
              onCategoryChange={updateCategory}
            />
          </VStack>
        </ScrollArea>

        {hasActiveFilters && (
          <Box className="border-t p-4 shrink-0">
            <FilterSummary filters={localFilters} onClearAll={handleClear} />
          </Box>
        )}

        <SheetFooter className="flex-row gap-2 shrink-0">
          <Button variant="default" onClick={handleApply} className="flex-3">
            Apply
          </Button>
          <Button variant="outline" onClick={handleCancel} className="flex-1">
            Cancel
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

interface FilterPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const currentYear = new Date().getFullYear();
const MIN_YEAR = 1990;
const MAX_YEAR = currentYear;

const YEAR_OPTIONS = Array.from(
  { length: MAX_YEAR - MIN_YEAR + 1 },
  (_, i) => MAX_YEAR - i,
);

const PREFILLED_YEAR_RANGES = [
  { label: "Last 2 years", range: { min: currentYear - 2, max: currentYear } },
  { label: "Last 5 years", range: { min: currentYear - 5, max: currentYear } },
  {
    label: "Last 10 years",
    range: { min: currentYear - 10, max: currentYear },
  },
];

const CATEGORY_OPTIONS = [
  "Computer Science",
  "Medicine",
  "Chemistry",
  "Biology",
  "Materials Science",
  "Physics",
  "Geology",
  "Psychology",
  "Art",
  "History",
  "Geography",
  "Sociology",
  "Business",
  "Political Science",
  "Economics",
  "Philosophy",
  "Mathematics",
  "Engineering",
  "Environmental Science",
  "Agricultural and Food Sciences",
  "Education",
  "Law",
  "Linguistics",
] as const;

const parseNumberInput = (value: string) => {
  if (value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const YearFilter = ({
  yearRange,
  onYearRangeChange,
}: {
  yearRange?: { min?: number; max?: number };
  onYearRangeChange: (range: { min?: number; max?: number }) => void;
}) => {
  const hasYearFilter = yearRange?.min || yearRange?.max;

  function handleClear() {
    onYearRangeChange({});
  }

  return (
    <VStack className="gap-4">
      <HStack className="flex items-center justify-between">
        <Label>Publication Year</Label>
        <Button
          variant="secondary"
          size="sm"
          className="h-auto p-1 text-xs"
          onClick={handleClear}
          style={{ visibility: hasYearFilter ? "visible" : "hidden" }}
        >
          Clear
        </Button>
      </HStack>
      <ScrollArea className="h-8 w-full">
        <HStack className="gap-2">
          {PREFILLED_YEAR_RANGES.map(({ label, range }) => (
            <Button
              key={label}
              variant="outline"
              size="sm"
              className="text-xs bg-muted"
              onClick={() => onYearRangeChange(range)}
            >
              {label}
            </Button>
          ))}
        </HStack>
      </ScrollArea>
      <HStack className="gap-2">
        <VStack className="gap-1.5">
          <Label htmlFor="year-from" className="text-xs text-muted-foreground">
            From
          </Label>
          <Select
            value={yearRange?.min?.toString() || ""}
            onValueChange={(value) => {
              const year = value ? parseInt(value) : undefined;
              onYearRangeChange({
                ...yearRange,
                min: year,
              });
            }}
          >
            <SelectTrigger className="h-9 w-24">
              <SelectValue placeholder="--" />
            </SelectTrigger>
            <SelectContent>
              {YEAR_OPTIONS.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </VStack>
        <VStack className="gap-1.5">
          <Label htmlFor="year-to" className="text-xs text-muted-foreground">
            To
          </Label>
          <Select
            value={yearRange?.max?.toString() || ""}
            onValueChange={(value) => {
              const year = value ? parseInt(value) : undefined;
              onYearRangeChange({
                ...yearRange,
                max: year,
              });
            }}
          >
            <SelectTrigger className="h-9 w-24">
              <SelectValue placeholder="--" />
            </SelectTrigger>
            <SelectContent>
              {YEAR_OPTIONS.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </VStack>
      </HStack>
    </VStack>
  );
};

const CitationFilter = ({
  minCitationCount,
  maxCitationCount,
  onMinCitationCountChange,
  onMaxCitationCountChange,
}: {
  minCitationCount?: number;
  maxCitationCount?: number;
  onMinCitationCountChange: (value: number | undefined) => void;
  onMaxCitationCountChange: (value: number | undefined) => void;
}) => {
  const hasCitationFilter =
    minCitationCount !== undefined || maxCitationCount !== undefined;

  function handleClear() {
    onMinCitationCountChange(undefined);
    onMaxCitationCountChange(undefined);
  }

  return (
    <VStack className="gap-4">
      <HStack className="flex items-center justify-between">
        <Label>Citations</Label>
        <Button
          variant="secondary"
          size="sm"
          className="h-auto p-1 text-xs"
          onClick={handleClear}
          style={{ visibility: hasCitationFilter ? "visible" : "hidden" }}
        >
          Clear
        </Button>
      </HStack>
      <HStack className="gap-2">
        <VStack className="gap-1.5">
          <Label
            htmlFor="citations-min"
            className="text-xs text-muted-foreground"
          >
            Minimum
          </Label>
          <Input
            id="citations-min"
            type="number"
            min={0}
            value={minCitationCount ?? ""}
            onChange={(event) =>
              onMinCitationCountChange(parseNumberInput(event.target.value))
            }
            className="w-28"
          />
        </VStack>
        <VStack className="gap-1.5">
          <Label
            htmlFor="citations-max"
            className="text-xs text-muted-foreground"
          >
            Maximum
          </Label>
          <Input
            id="citations-max"
            type="number"
            min={0}
            value={maxCitationCount ?? ""}
            onChange={(event) =>
              onMaxCitationCountChange(parseNumberInput(event.target.value))
            }
            className="w-28"
          />
        </VStack>
      </HStack>
    </VStack>
  );
};

const CategoryFilter = ({
  category,
  onCategoryChange,
}: {
  category?: string[];
  onCategoryChange: (value: string[]) => void;
}) => {
  const handleToggle = (field: string) => {
    const current = category || [];
    const updated = current.includes(field)
      ? current.filter((c) => c !== field)
      : [...current, field];
    onCategoryChange(updated.length > 0 ? updated : []);
  };

  // const hasCategory = category && category.length > 0;

  // function handleClear() {
  //   onCategoryChange([]);
  // }

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="category">
        <AccordionTrigger>Field of Study</AccordionTrigger>
        <AccordionContent>
          <VStack className="">
            <HStack className="flex items-center justify-between">
              {/* <Button
                variant="secondary"
                size="sm"
                className="h-auto p-1 text-xs"
                onClick={handleClear}
                style={{ visibility: hasCategory ? "visible" : "hidden" }}
              >
                Search
              </Button> */}
            </HStack>
            <ScrollArea className="h-full w-full">
              <VStack className="gap-2 pl-1 pr-2">
                {CATEGORY_OPTIONS.map((field) => (
                  <HStack key={field} className="items-start gap-2">
                    <Label
                      htmlFor={`category-${field}`}
                      className="cursor-pointer leading-tight text-md"
                    >
                      <Checkbox
                        id={`category-${field}`}
                        checked={category?.includes(field) || false}
                        onCheckedChange={() => handleToggle(field)}
                      />
                      {field}
                    </Label>
                  </HStack>
                ))}
              </VStack>
            </ScrollArea>
          </VStack>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

const JournalFilter = ({
  journalQuartile,
  onJournalQuartileChange,
}: {
  journalQuartile?: "Q1" | "Q2" | "Q3" | "Q4";
  onJournalQuartileChange: (
    value: "Q1" | "Q2" | "Q3" | "Q4" | undefined,
  ) => void;
}) => {
  return (
    <VStack className="gap-3">
      <Label>Publication Quality</Label>

      <VStack className="gap-1.5">
        <Label
          htmlFor="journal-quartile"
          className="text-xs text-muted-foreground"
        >
          Journal Quartile
        </Label>
        <Select
          value={journalQuartile || "all"}
          onValueChange={(value) => {
            onJournalQuartileChange(
              value === "all"
                ? undefined
                : (value as "Q1" | "Q2" | "Q3" | "Q4"),
            );
          }}
        >
          <SelectTrigger id="journal-quartile" className="h-9 w-32">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Q1">Q1</SelectItem>
            <SelectItem value="Q2">Q2</SelectItem>
            <SelectItem value="Q3">Q3</SelectItem>
            <SelectItem value="Q4">Q4</SelectItem>
          </SelectContent>
        </Select>
      </VStack>
    </VStack>
  );
};

const FilterSummary = ({
  filters,
  onClearAll,
}: {
  filters: SearchFilters;
  onClearAll: () => void;
}) => {
  const activeFilters: string[] = [];

  if (filters.authorName) {
    activeFilters.push(`Author: ${filters.authorName}`);
  }

  if (filters.venue) {
    activeFilters.push(`Venue: ${filters.venue}`);
  }

  if (filters.yearMin || filters.yearMax) {
    const min = filters.yearMin || "--";
    const max = filters.yearMax || "--";
    activeFilters.push(`Year: ${min}-${max}`);
  }

  if (
    filters.minCitationCount !== undefined ||
    filters.maxCitationCount !== undefined
  ) {
    const min = filters.minCitationCount ?? "--";
    const max = filters.maxCitationCount ?? "--";
    activeFilters.push(`Citations: ${min}-${max}`);
  }

  if (filters.fieldOfStudy && filters.fieldOfStudy.length > 0) {
    activeFilters.push(`Fields: ${filters.fieldOfStudy.length} selected`);
  }

  if (filters.journalQuartile) {
    activeFilters.push(`Journal: ${filters.journalQuartile}`);
  }

  return (
    <VStack className="gap-3">
      <HStack className="justify-between">
        <TypographyP variant="accent" size="sm">
          Active Filters
        </TypographyP>
        <Button
          variant="destructive"
          size="sm"
          onClick={onClearAll}
          className="h-auto p-1 text-xs"
        >
          Clear All
        </Button>
      </HStack>
      <Box className="max-h-20 overflow-y-auto">
        <HStack className="flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <Badge
              key={filter}
              variant="secondary"
              className="whitespace-nowrap"
            >
              {filter}
            </Badge>
          ))}
        </HStack>
      </Box>
    </VStack>
  );
};
