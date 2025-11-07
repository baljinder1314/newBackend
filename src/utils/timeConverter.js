// Function to convert either a "HH:mm" string or a full date string into a Date
export const convertTimeToDate = (timeString) => {
  if (!timeString) {
    throw new Error("time string is required");
  }

  // If format is "HH:mm" (contains a colon), set today's date with given time
  if (typeof timeString === "string" && timeString.includes(":")) {
    const parts = timeString.split(":").map(Number);
    if (parts.length !== 2 || parts.some((n) => Number.isNaN(n))) {
      throw new Error("Invalid HH:mm format");
    }
    const [hours, minutes] = parts;
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new Error("Hour or minute out of range");
    }

    const now = new Date(); // today
    now.setHours(hours, minutes, 0, 0);
    return now;
  }

  // Otherwise try to parse a full date-time string
  const parsed = new Date(timeString);
  if (isNaN(parsed.getTime())) {
    throw new Error("Invalid date string");
  }
  return parsed;
};
