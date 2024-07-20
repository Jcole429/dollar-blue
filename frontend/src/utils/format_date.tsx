export const formatDate = (date: Date) => {
  if (!(date instanceof Date)) {
    console.error("Invalid date object:", date);
    return "Invalid date";
  }
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};
