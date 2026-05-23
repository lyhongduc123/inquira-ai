export const ABORT_REASON = "stream_cancelled";

export function isAbortError(error: unknown): boolean {
  if (!error) {
    return false;
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return true;
  }

  if (error instanceof Error) {
    return (
      error.name === "AbortError" ||
      error.message.toLowerCase().includes("aborted") ||
      error.message.toLowerCase().includes("stream_cancelled")
    );
  }

  return false;
}
