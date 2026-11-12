// --- Constants
const STORAGE_KEY = "expense_tracker_transactions";

const CATEGORY_COLORS = {
  Food: "#FF6384",
  Transport: "#36A2EB",
  Fun: "#FFCE56",
};

const NAME_MAX = 100;
const AMOUNT_MIN = 0.01;
const AMOUNT_MAX = 999999999.99;

// --- Storage

/**
 * Reads and parses transactions from Local Storage.
 * @returns {Array} Parsed transactions array on success.
 *   On corrupted JSON: returns [] and sets result.error = "corrupted".
 *   On storage unavailable: returns [] and sets result.error = "unavailable".
 */
function loadFromStorage() {
  let raw;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    const result = [];
    result.error = "unavailable";
    return result;
  }

  if (raw === null) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    const result = [];
    result.error = "corrupted";
    return result;
  }
}
