export const copyTextWithEvent = (text: string) => {
  let copied = false;
  const listener = (event: ClipboardEvent) => {
    event.preventDefault();
    event.clipboardData?.setData("text/plain", text);
    copied = true;
  };
  document.addEventListener("copy", listener);
  const success = document.execCommand("copy");
  document.removeEventListener("copy", listener);

  if (!success || !copied) {
    throw new Error("Copy event fallback failed");
  }
};
