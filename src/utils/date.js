/**
 * Helper to get the current system time.
 * Supports mocking the current date/time via process.env.MOCK_DATE in development.
 * This is crucial for testing the November 2024 vaccination drive constraints in 2026.
 * @returns {Date} - The current or mocked Date object.
 */
const getCurrentTime = () => {
  if (process.env.MOCK_DATE) {
    return new Date(process.env.MOCK_DATE);
  }
  return new Date();
};

module.exports = {
  getCurrentTime
};
