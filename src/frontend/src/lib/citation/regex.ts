export const LEGACY_FORMAT_REGEX = /\[(\d+)\]\(([^)]+)\)/g;
export const SCOPED_CITATION_REGEX =
  /\(cite:([^|)]+)\|([^|)]+)(?:\|(\d+)\|(\d+))?\)/g;
export const CITATIONS_REGEX = /\(?cite:([^()\s]+(?:,[^()\s]+)*)\)?/g;