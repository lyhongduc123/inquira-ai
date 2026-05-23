import { Button } from "@/components/ui/button";
import { AuthorMetadataDTO } from "@/types/author.type";
import { PaperMetadata } from "@/types/paper.type";

interface Props {
  sources: PaperMetadata[];
}

export default function ExportButton({
  sources,
  ...props
}: Props & React.ComponentPropsWithoutRef<typeof Button>) {
  const headers = [
      "Paper ID",
      "Title",
      "Authors",
      "Year",
      "Venue",
      "Venue Ranking",
      "DOI",
      "Citations",
      "References",
      "URL",
      "Open Access",
      "Retracted"
    ];
  

  const exportCSV = () => {
    if (!sources || sources.length === 0) return;
    const rows = sources.map((paper) => {
      const authorNames = paper.authors?.map((a: AuthorMetadataDTO) => a.name).join("; ") || "";
      const doi = paper.externalIds?.doi || "";
      const venue = paper.venue || "Unknown Venue";
      const quartile = paper.journal?.sjrBestQuartile || "Unknown";
      const rowData = [
        paper.paperId,
        paper.title,
        authorNames,
        paper.year,
        venue,
        quartile,
        doi,
        paper.citationCount,
        paper.referenceCount,
        paper.url,
        paper.isOpenAccess,
        paper.isRetracted
      ];

      return rowData.map(escapeCSV).join(",");
    });

    const csvContent = headers.join(",") + "\n" + rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `inquira-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  return (
    // Forced use html for correctly padding behavior
    <button onClick={exportCSV} {...props}>
      {props.children}
    </button>
  );
}

const escapeCSV = (
    value: string | number | boolean | null | undefined,
  ): string => {
    if (value === null || value === undefined) return "";
    const stringValue = String(value);

    if (
      stringValue.includes(",") ||
      stringValue.includes('"') ||
      stringValue.includes("\n")
    ) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };