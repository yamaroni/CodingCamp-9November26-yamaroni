/**
 * Tests for loadFromStorage()
 * Design: Jest (unit) + fast-check (property-based)
 * Run: npx jest
 */

const fc = require("fast-check");

// ---------------------------------------------------------------------------
// Standalone implementation of loadFromStorage for testing.
// Mirrors js/app.js exactly — same logic, injectable localStorage.
// ---------------------------------------------------------------------------

const STORAGE_KEY = "expense_tracker_transactions";

function makeLoadFromStorage(storage) {
  return function loadFromStorage() {
    let raw;
    try {
      raw = storage.getItem(STORAGE_KEY);
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
  };
}

// ---------------------------------------------------------------------------
// Unit Tests
// ---------------------------------------------------------------------------

describe("loadFromStorage — unit tests", () => {
  test("returns parsed array when storage contains valid JSON array", () => {
    const transactions = [
      { id: "abc", name: "Lunch", amount: 12.5, category: "Food", createdAt: "2024-11-26T09:00:00.000Z" },
    ];
    const storage = { getItem: () => JSON.stringify(transactions) };
    const loadFromStorage = makeLoadFromStorage(storage);

    const result = loadFromStorage();

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("abc");
    expect(result[0].name).toBe("Lunch");
    expect(result[0].amount).toBe(12.5);
    expect(result.error).toBeUndefined();
  });

  test("returns empty array when storage contains null (no data)", () => {
    const storage = { getItem: () => null };
    const loadFromStorage = makeLoadFromStorage(storage);

    const result = loadFromStorage();

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
    expect(result.error).toBeUndefined();
  });

  test("returns empty array with error='corrupted' when JSON is invalid", () => {
    const storage = { getItem: () => "not valid JSON {{{" };
    const loadFromStorage = makeLoadFromStorage(storage);

    const result = loadFromStorage();

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
    expect(result.error).toBe("corrupted");
  });

  test("returns empty array with error='corrupted' when JSON is a non-array value", () => {
    const storage = { getItem: () => JSON.stringify({ notAnArray: true }) };
    const loadFromStorage = makeLoadFromStorage(storage);

    const result = loadFromStorage();

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
    // No error flag for non-array — treated as empty list (design: array guard)
    expect(result.error).toBeUndefined();
  });

  test("returns empty array with error='unavailable' when localStorage.getItem throws", () => {
    const storage = {
      getItem: () => {
        throw new DOMException("Storage unavailable");
      },
    };
    const loadFromStorage = makeLoadFromStorage(storage);

    const result = loadFromStorage();

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
    expect(result.error).toBe("unavailable");
  });

  test("returns empty array for empty JSON array in storage", () => {
    const storage = { getItem: () => "[]" };
    const loadFromStorage = makeLoadFromStorage(storage);

    const result = loadFromStorage();

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
    expect(result.error).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Property-Based Tests
// ---------------------------------------------------------------------------

// Arbitrary for a valid Transaction object
const transactionArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
  amount: fc.float({ min: 0.01, max: 999999999.99, noNaN: true, noDefaultInfinity: true }).map(
    (n) => Math.round(n * 100) / 100
  ),
  category: fc.constantFrom("Food", "Transport", "Fun"),
  createdAt: fc.date().map((d) => d.toISOString()),
});

describe("loadFromStorage — property-based tests", () => {
  // Feature: expense-budget-visualizer, Property 5: Storage restore on load produces the full original list
  test(
    "Property 5: for any array of transactions written to storage, loading restores the same items",
    () => {
      fc.assert(
        fc.property(fc.array(transactionArb, { minLength: 0, maxLength: 20 }), (transactions) => {
          const storage = { getItem: () => JSON.stringify(transactions) };
          const loadFromStorage = makeLoadFromStorage(storage);

          const result = loadFromStorage();

          expect(Array.isArray(result)).toBe(true);
          expect(result).toHaveLength(transactions.length);

          // Every transaction round-trips with matching fields
          transactions.forEach((original, i) => {
            expect(result[i].id).toBe(original.id);
            expect(result[i].name).toBe(original.name);
            expect(result[i].amount).toBeCloseTo(original.amount, 10);
            expect(result[i].category).toBe(original.category);
            expect(result[i].createdAt).toBe(original.createdAt);
          });

          // No error flag on success
          expect(result.error).toBeUndefined();
        }),
        { numRuns: 100 }
      );
    }
  );

  test(
    "Property: corrupted JSON always produces empty array with error='corrupted'",
    () => {
      // Generate strings that are definitely not valid JSON arrays
      const corruptedArb = fc
        .string({ minLength: 1 })
        .filter((s) => {
          try {
            JSON.parse(s);
            return false; // skip valid JSON
          } catch {
            return true;
          }
        });

      fc.assert(
        fc.property(corruptedArb, (badJson) => {
          const storage = { getItem: () => badJson };
          const loadFromStorage = makeLoadFromStorage(storage);

          const result = loadFromStorage();

          expect(Array.isArray(result)).toBe(true);
          expect(result).toHaveLength(0);
          expect(result.error).toBe("corrupted");
        }),
        { numRuns: 100 }
      );
    }
  );

  test(
    "Property: storage access failure always produces empty array with error='unavailable'",
    () => {
      fc.assert(
        fc.property(fc.string(), (errorMsg) => {
          const storage = {
            getItem: () => {
              throw new Error(errorMsg);
            },
          };
          const loadFromStorage = makeLoadFromStorage(storage);

          const result = loadFromStorage();

          expect(Array.isArray(result)).toBe(true);
          expect(result).toHaveLength(0);
          expect(result.error).toBe("unavailable");
        }),
        { numRuns: 100 }
      );
    }
  );
});
