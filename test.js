function generateEnrollmentNumber(courseCode, startDate) {
  // Parse the start date to get month and year
  const date = new Date(startDate);
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // +1 because getMonth() returns 0-11
  const year = date.getFullYear().toString().slice(-2); // Get last 2 digits of year

  // Generate a random 6-digit number
  const randomNumber = Math.floor(100000 + Math.random() * 900000).toString();

  // Format: COURSECODE-MMYY-RANDOM
  return `TMP-${courseCode}-${month}${year}-${randomNumber}`;
}

console.log(generateEnrollmentNumber("CCICH", "2025-10-25"));
