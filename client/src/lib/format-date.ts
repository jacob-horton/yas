export const formatDateTime = (isoString: string) => {
  if (!isoString) return "";
  const date = new Date(isoString);

  // Example Output: "24 Oct 2025, 18:30"
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export const formatDate = (isoString: string) => {
  if (!isoString) return "";
  const date = new Date(isoString);

  // Example Output: "24 Oct 2025"
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date);
};
