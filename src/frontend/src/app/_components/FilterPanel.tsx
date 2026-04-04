"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
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

export interface SearchFilters {
  author?: string;
  year_min?: number;
  year_max?: number;
  venue?: string;
  min_citations?: number;
  max_citations?: number;
  // Legacy fields for UI compatibility (can be removed later)
  yearRange?: {
    min?: number;
    max?: number;
  };
  category?: string[];
  openAccessOnly?: boolean;
  excludePreprints?: boolean;
  topJournalsOnly?: boolean;
}

export function FilterPanel({
  open,
  onOpenChange,
}: FilterPanelProps) {
  const { filters, setParams } = useSearchFilters();
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  const hasActiveFilters = Object.values(localFilters).some((value) => {
    if (typeof value === "object" && value !== null) {
      return Object.values(value).some((v) => v !== undefined);
    }
    return value !== undefined && value !== false;
  });

  function updateYearRange(yearRange: { min?: number; max?: number }) {
    setLocalFilters((prev) => ({
      ...prev,
      yearRange,
    }));
  }

  function updateCategory(value: string[]) {
    setLocalFilters((prev) => ({
      ...prev,
      category: value.length > 0 ? value : undefined,
    }));
  }

  function updateOpenAccess(value: boolean | undefined) {
    setLocalFilters((prev) => ({
      ...prev,
      openAccessOnly: value,
    }));
  }

  function updateExcludePreprints(value: boolean | undefined) {
    setLocalFilters((prev) => ({
      ...prev,
      excludePreprints: value,
    }));
  }

  function updateTopJournals(value: boolean | undefined) {
    setLocalFilters((prev) => ({
      ...prev,
      topJournalsOnly: value,
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
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
                  yearRange={localFilters.yearRange}
                  onYearRangeChange={updateYearRange}
                />
              </Box>
              {/* <Separator
                orientation="vertical"
                className="h-auto self-stretch"
              />
              <Box className="flex-1"></Box> */}
            </HStack>

            <Separator />

            <PaperTypeFilter
              openAccessOnly={localFilters.openAccessOnly}
              excludePreprints={localFilters.excludePreprints}
              onOpenAccessChange={updateOpenAccess}
              onExcludePreprintsChange={updateExcludePreprints}
            />

            <CategoryFilter
              category={localFilters.category}
              onCategoryChange={updateCategory}
            />
          </VStack>
        </ScrollArea>

        {hasActiveFilters && (
          <Box className="border-t p-4 flex-shrink-0">
            <FilterSummary filters={localFilters} onClearAll={handleClear} />
          </Box>
        )}

        <SheetFooter className="flex-row gap-2 flex-shrink-0">
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

const YearFilter = ({
  yearRange,
  onYearRangeChange,
}: {
  yearRange?: { min?: number; max?: number };
  onYearRangeChange: (range: { min?: number; max?: number }) => void;
}) => {
  const hasYearFilter = yearRange?.min || yearRange?.max;
  const isSingleYear = yearRange?.min === yearRange?.max && yearRange?.min;
  const [activeTab, setActiveTab] = useState<string>(
    isSingleYear ? "single" : "range",
  );

  function handleClear() {
    onYearRangeChange({});
  }

  function handleSingleYearChange(value: string) {
    const year = value ? parseInt(value) : undefined;
    onYearRangeChange({ min: year, max: year });
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

  const hasCategory = category && category.length > 0;

  function handleClear() {
    onCategoryChange([]);
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="category">
        <AccordionTrigger>Field of Study</AccordionTrigger>
        <AccordionContent>
          <VStack className="gap-4">
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
                    <Checkbox
                      id={`category-${field}`}
                      checked={category?.includes(field) || false}
                      onCheckedChange={() => handleToggle(field)}
                    />
                    <Label
                      htmlFor={`category-${field}`}
                      className="cursor-pointer leading-tight"
                    >
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

const PaperTypeFilter = ({
  openAccessOnly,
  excludePreprints,
  journalLevel,
  onOpenAccessChange,
  onExcludePreprintsChange,
}: {
  openAccessOnly?: boolean;
  excludePreprints?: boolean;
  journalLevel?: string;
  onOpenAccessChange: (value: boolean | undefined) => void;
  onExcludePreprintsChange: (value: boolean | undefined) => void;
  // onJournalLevelChange: (value: string | undefined) => void;
}) => {
  return (
    <VStack className="gap-3">
      <Label>Paper Type</Label>

      <HStack className="items-center gap-3">
        <Checkbox
          id="open-access"
          checked={openAccessOnly || false}
          onCheckedChange={(checked) =>
            onOpenAccessChange(checked ? true : undefined)
          }
        />
        <Label htmlFor="open-access" className="cursor-pointer font-normal">
          Open Access Only
        </Label>
      </HStack>

      <HStack className="items-center gap-3">
        <Checkbox
          id="exclude-preprints"
          checked={excludePreprints || false}
          onCheckedChange={(checked) =>
            onExcludePreprintsChange(checked ? true : undefined)
          }
        />
        <Label
          htmlFor="exclude-preprints"
          className="cursor-pointer font-normal"
        >
          Exclude Preprints
        </Label>
      </HStack>
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

  if (filters.yearRange?.min || filters.yearRange?.max) {
    const min = filters.yearRange.min || "--";
    const max = filters.yearRange.max || "--";
    activeFilters.push(`Year: ${min}-${max}`);
  }

  if (filters.category && filters.category.length > 0) {
    activeFilters.push(`Fields: ${filters.category.length} selected`);
  }

  if (filters.openAccessOnly) {
    activeFilters.push("Open Access");
  }

  if (filters.excludePreprints) {
    activeFilters.push("No Preprints");
  }

  if (filters.topJournalsOnly) {
    activeFilters.push("Top Journals (Q1)");
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
