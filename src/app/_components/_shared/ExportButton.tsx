import { Button } from "@/components/ui/button";
import { PaperMetadata } from "@/types/paper.type";

interface Props {
  sources: PaperMetadata[];
}

export default function ExportButton({ sources }: Props) {
  const exportCSV = () => {
    const headers = Object.keys(sources[0]).join(",");
    const rows = sources.map((d) => Object.values(d).join(",")).join("\n");
    const csv = headers + "\n" + rows;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "export.csv";
    link.click();
  };
  return (
    <Button variant="outline" size="sm" onClick={exportCSV}>
      Export
    </Button>
  );
}
