# Implementation Plan: Expense & Budget Visualizer

## Overview

Build a fully client-side expense tracker SPA using plain HTML, CSS, and Vanilla JavaScript. The app lets users log expenses by category, see a running balance, and visualize spending via a live pie chart powered by Chart.js (CDN). All data persists in Local Storage. No build step, no package manager, no backend.

## Tasks

- [x] 1. Set up project structure and constants
  - Create the directory layout: `index.html`, `css/styles.css`, `js/app.js`
  - In `app.js`, define the `// --- Constants` section: `STORAGE_KEY`, `CATEGORY_COLORS` map (`Food: "#FF6384"`, `Transport: "#36A2EB"`, `Fun: "#FFCE56"`), and validation limits (`NAME_MAX`, `AMOUNT_MIN`, `AMOUNT_MAX`)
  - In `index.html`, add the page shell: `<head>` with meta charset/viewport, link to `styles.css`, Chart.js CDN `<script>`, and `<script src="js/app.js" defer>`
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.6_

- [x] 2. Build HTML markup and base CSS
  - [x] 2.1 Write the full HTML structure in `index.html`
    - `#balance-display` section at the top
    - `#input-form` with text input (name), number input (amount), category `<select>`, submit button, and sibling `<span class="field-error">` for each field
    - `#error-banner` element (initially hidden) with a close button
    - `#transaction-list` as a `<ul>`
    - `#chart-container` with `<canvas id="pie-chart">` and a placeholder `<p>`
    - Ensure every form input has a `<label>` and that error spans are linked via `aria-describedby`
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 6.1_
  - [x] 2.2 Write base styles in `css/styles.css`
    - Layout: responsive single-column on mobile, two-column on wider screens
    - Form elements and submit button with minimum 44×44 px touch targets
    - Category badge styles (color-coded background matching `CATEGORY_COLORS`)
    - `.field-error` hidden by default, shown with `.visible` class
    - `#error-banner` hidden by default, shown with `.visible` class; auto-dismiss animation
    - Minimum body font 14px; visually distinct labels vs. values
    - _Requirements: 7.3, 6.1_

- [ ] 3. Implement Local Storage module
  - [-] 3.1 Write `loadFromStorage()` in the `// --- Storage` section of `app.js`
    - Wrap `localStorage.getItem(STORAGE_KEY)` and `JSON.parse` in a try/catch
    - On success: return parsed array
    - On parse error: return `{ error: "corrupted" }` and empty array
    - On unavailable storage: return `{ error: "unavailable" }` and empty array
    - _Requirements: 2.3, 5.3, 5.5, 2.5_
  - [~] 3.2 Write `saveToStorage(transactions)` in the `// --- Storage` section
    - Wrap `localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))` in a try/catch
    - On error: return `{ success: false }`; on success: return `{ success: true }`
    - _Requirements: 5.1, 5.2, 1.5, 2.8_


- [ ] 4. Implement the Validator
  - [~] 4.1 Write `validateForm(formData)` in the `// --- Validator` section of `app.js`
    - Accept `{ name, amount, category }`
    - Check name: non-empty after trim, ≤ 100 chars
    - Check amount: parseable as number, in [0.01, 999999999.99], at most 2 decimal places
    - Check category: one of `"Food"`, `"Transport"`, `"Fun"`
    - Return `{ valid: boolean, errors: { name?, amount?, category? } }`
    - _Requirements: 1.2, 1.3_


- [ ] 5. Implement state mutations
  - [ ] 5.1 Set up the `// --- State` section in `app.js`
    - Declare `let transactions = []` as the single in-memory source of truth
    - _Requirements: 5.3_
  - [ ] 5.2 Write `addTransaction(formData)` in the `// --- State Mutations` section
    - Build a Transaction object: `id` via `crypto.randomUUID()`, `name` (trimmed), `amount` (parseFloat), `category`, `createdAt` (ISO 8601)
    - Prepend to `transactions` array (new item at index 0)
    - Call `saveToStorage`; if it returns `{ success: false }`, revert the prepend and return an error signal
    - Return `{ success: true }` on success
    - _Requirements: 1.4, 1.5, 2.1, 5.1_

  - [ ] 5.4 Write `deleteTransaction(id)` in the `// --- State Mutations` section
    - Filter `transactions` to remove the item with the matching `id`
    - Call `saveToStorage`; if it returns `{ success: false }`, restore the original array and return an error signal
    - Return `{ success: true }` on success
    - _Requirements: 2.7, 2.8, 5.2_


- [ ] 6. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement renderers
  - [ ] 7.1 Write `renderBalance()` in the `// --- Renderers` section
    - Sum all `transactions[i].amount` values
    - Set `document.querySelector('#balance-display').textContent` to `sum.toFixed(2)`
    - _Requirements: 3.1, 3.4_

  - [ ] 7.3 Write `renderList()` in the `// --- Renderers` section
    - Sort `transactions` descending by `createdAt` before rendering
    - For each transaction, create a `<li>` with item name, formatted amount (`toFixed(2)`), category badge, and a delete `<button data-id="...">` with accessible label
    - When `transactions` is empty, show `<p class="empty-message">` instead
    - _Requirements: 2.1, 2.4, 2.6_

  - [ ] 7.5 Write `buildChartData(transactions)` helper function
    - Aggregate `amount` by category from the transactions array
    - Return `{ labels, data, backgroundColor }` using only categories with at least one transaction
    - Percentages per category = `(categoryTotal / grandTotal) * 100` rounded to one decimal place
    - _Requirements: 4.1, 4.5, 4.6_

  - [ ] 7.7 Write `renderChart()` in the `// --- Renderers` section
    - On first call, instantiate a `Chart` object on `#pie-chart` (type `"pie"`)
    - On subsequent calls, update `chart.data` with the result of `buildChartData` and call `chart.update()`
    - When `transactions` is empty, hide `<canvas>` and show the placeholder `<p>`; when non-empty, do the reverse
    - Apply fixed colors from `CATEGORY_COLORS`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  - [ ] 7.8 Write `renderAll()` orchestrator in the `// --- Renderers` section
    - Call `renderBalance()`, `renderList()`, `renderChart()` in sequence
    - _Requirements: 3.2, 3.3, 4.2, 4.3_

- [ ] 8. Implement event handlers and init
  - [ ] 8.1 Write the form submit event handler in `// --- Event Handlers`
    - Read form values, call `validateForm`
    - On invalid: display inline errors via `field-error` spans; do not submit
    - On valid: call `addTransaction`; on success call `renderAll()` and `form.reset()`; on storage failure show `#error-banner`
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ] 8.3 Write the delete button click event handler (delegated on `#transaction-list`) in `// --- Event Handlers`
    - Identify the target `data-id` attribute
    - Call `deleteTransaction(id)`; on success call `renderAll()`; on storage failure show `#error-banner` and do not remove the item from view
    - _Requirements: 2.7, 2.8_
  - [ ] 8.4 Write the `#error-banner` show/hide helper and auto-dismiss logic
    - `showError(message)`: set banner text, add `.visible` class
    - Auto-dismiss after 5 seconds; manual close via the close button removes `.visible`
    - _Requirements: 1.5, 2.5, 2.8, 5.5_
  - [ ] 8.5 Write `init()` in the `// --- Init` section and wire to `DOMContentLoaded`
    - Call `loadFromStorage()`; handle `error: "corrupted"` (show error banner, empty state) and `error: "unavailable"` (show error banner, empty state)
    - Assign `transactions` from the loaded array
    - Call `renderAll()`
    - _Requirements: 2.3, 2.5, 5.3, 5.4, 5.5_

- [ ] 9. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- The design specifies **Jest** for unit tests and **fast-check** for property-based tests; run both with `npx jest` (no global install needed)
- All property tests must include a comment `// Feature: expense-budget-visualizer, Property N: <property text>` and run a minimum of 100 iterations
- The Chart.js instance must be created once and mutated on updates — do not destroy and recreate on every render
- The unidirectional data flow (Action → State Update → Local Storage → Render) must be preserved throughout; renderers must never mutate state
- Error handling follows a fail-safe strategy: if data cannot be persisted, the UI does not update; if data cannot be read, the app starts fresh

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1", "2.2", "3.1", "3.2", "5.1"] },
    { "id": 1, "tasks": ["3.3", "4.1"] },
    { "id": 2, "tasks": ["4.2", "4.3", "5.2"] },
    { "id": 3, "tasks": ["5.3", "5.4", "7.1", "7.3", "7.5"] },
    { "id": 4, "tasks": ["5.5", "7.2", "7.4", "7.6", "7.7"] },
    { "id": 5, "tasks": ["7.8", "8.1", "8.3", "8.4", "8.5"] },
    { "id": 6, "tasks": ["8.2", "8.6"] }
  ]
}
```
