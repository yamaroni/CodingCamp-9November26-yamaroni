# Requirements Document

## Introduction

The Expense & Budget Visualizer is a client-side web application that allows users to track personal expenses by category, view a running total balance, and visualize spending distribution through a pie chart. The app runs entirely in the browser using HTML, CSS, and Vanilla JavaScript, with all data persisted via the browser's Local Storage API. No backend server or complex setup is required.

## Glossary

- **App**: The Expense & Budget Visualizer web application.
- **Transaction**: A single expense entry consisting of an item name, an amount, and a category.
- **Category**: A classification label for a transaction; one of: Food, Transport, or Fun.
- **Transaction_List**: The scrollable UI component that displays all stored transactions.
- **Balance_Display**: The UI component at the top of the page that shows the current total of all transaction amounts.
- **Input_Form**: The UI form component used to enter and submit new transactions.
- **Pie_Chart**: The visual chart component that displays spending distribution by category.
- **Local_Storage**: The browser's Local Storage API used to persist transaction data client-side.
- **Validator**: The logic component responsible for checking that all required form fields are filled before submission.

---

## Requirements

### Requirement 1: Input Form

**User Story:** As a user, I want to enter a new expense using a form with item name, amount, and category fields, so that I can record my spending quickly.

#### Acceptance Criteria

1. THE Input_Form SHALL display a text field for item name with a maximum length of 100 characters, a numeric field for amount, and a dropdown selector for category (Food, Transport, Fun).
2. WHEN the user submits the Input_Form, THE Validator SHALL check that the item name field is not empty, the amount field contains a positive numeric value between 0.01 and 999,999,999.99 with at most 2 decimal places, and a category has been selected.
3. IF the Validator detects that any required field is empty or invalid, THEN THE Input_Form SHALL display an inline error message adjacent to each offending field indicating why that field is invalid, and SHALL NOT submit the transaction.
4. WHEN all fields pass validation and the user submits the Input_Form, THE App SHALL add the new Transaction to the Transaction_List and persist it to Local_Storage.
5. IF Local_Storage is unavailable when the App attempts to persist a Transaction, THEN THE App SHALL display an error message indicating that the transaction could not be saved, and SHALL NOT add the Transaction to the Transaction_List.
6. WHEN a Transaction is successfully added, THE Input_Form SHALL reset all fields to their default empty state.

---

### Requirement 2: Transaction List

**User Story:** As a user, I want to see all my recorded expenses in a scrollable list, so that I can review my spending history.

#### Acceptance Criteria

1. WHEN the App loads or the Transaction_List changes, THE Transaction_List SHALL display each Transaction's item name, amount, and category, sorted by recorded date with the most recent Transaction first.
2. THE Transaction_List SHALL be scrollable when the number of transactions exceeds the visible area.
3. WHEN the App loads and Local_Storage contains one or more Transactions, THE Transaction_List SHALL populate with all Transactions retrieved from Local_Storage.
4. WHEN the App loads and Local_Storage contains no Transactions, THE Transaction_List SHALL display a message indicating that no transactions have been recorded.
5. IF Local_Storage cannot be read on App load, THEN THE App SHALL display an error message indicating that transaction history is unavailable.
6. WHEN the App loads or the Transaction_List changes, THE Transaction_List SHALL display a delete control for each Transaction.
7. WHEN the user activates the delete control for a Transaction, THE App SHALL remove that Transaction from the Transaction_List and from Local_Storage, then refresh the Transaction_List to reflect the updated set of Transactions.
8. IF a delete operation fails to update Local_Storage, THEN THE App SHALL display an error message indicating the deletion was unsuccessful and retain the Transaction in the Transaction_List.

---

### Requirement 3: Total Balance

**User Story:** As a user, I want to see my total spending displayed prominently at the top of the page, so that I always know how much I have spent in total.

#### Acceptance Criteria

1. THE Balance_Display SHALL show the sum of the amounts of all Transactions in the Transaction_List, formatted as a numeric value with exactly two decimal places.
2. WHEN a new Transaction is added, THE Balance_Display SHALL update to reflect the new total within 1 second without requiring a page reload.
3. WHEN a Transaction is deleted, THE Balance_Display SHALL update to reflect the new total within 1 second without requiring a page reload.
4. WHEN there are no Transactions, THE Balance_Display SHALL display a total of 0.00.

---

### Requirement 4: Visual Pie Chart

**User Story:** As a user, I want to see a pie chart of my spending by category, so that I can understand where my money is going at a glance.

#### Acceptance Criteria

1. THE Pie_Chart SHALL display each Category (Food, Transport, Fun) that has at least one Transaction as a slice sized proportionally to that Category's percentage of total spending, with each slice labeled with the Category name and its percentage rounded to one decimal place.
2. WHEN a new Transaction is added, THE Pie_Chart SHALL update automatically to reflect the new spending distribution without requiring a page reload.
3. WHEN a Transaction is deleted, THE Pie_Chart SHALL update automatically to reflect the revised spending distribution without requiring a page reload.
4. WHEN all Transactions are deleted, THE Pie_Chart SHALL replace the chart with a placeholder message indicating no spending data is available.
5. THE Pie_Chart SHALL render each Category using a fixed, distinct color: Food in one color, Transport in a second color, and Fun in a third color, with each color applied consistently across all chart updates.
6. IF a Category has no Transactions, THEN THE Pie_Chart SHALL omit that Category's slice from the display entirely.

---

### Requirement 5: Data Persistence

**User Story:** As a user, I want my expense data to be saved between browser sessions, so that I do not lose my records when I close or refresh the page.

#### Acceptance Criteria

1. WHEN a Transaction is added, THE App SHALL serialize all current Transactions as a JSON array and write them to Local_Storage under a single designated key.
2. WHEN a Transaction is deleted, THE App SHALL serialize all remaining Transactions as a JSON array and overwrite the existing Local_Storage entry under the same designated key.
3. WHEN the App initializes, THE App SHALL read the JSON array from Local_Storage, parse each Transaction, and restore the Transaction_List with all persisted entries, the Balance_Display recalculated from those entries, and the Pie_Chart reflecting the restored category totals.
4. IF Local_Storage contains no data on initialization, THEN THE App SHALL initialize with an empty Transaction_List, a zero Balance_Display, and an empty Pie_Chart state.
5. IF Local_Storage data cannot be parsed as valid JSON on initialization, THEN THE App SHALL discard the corrupted data, initialize with an empty Transaction_List, a zero Balance_Display, and an empty Pie_Chart state, and display an error message indicating that saved data could not be loaded.

---

### Requirement 6: Technical Constraints

**User Story:** As a developer, I want the app to follow defined structural and technology constraints, so that the codebase stays clean, maintainable, and deployable without a server.

#### Acceptance Criteria

1. THE App SHALL be implemented using only HTML, CSS, and Vanilla JavaScript, with no JavaScript frameworks such as React or Vue.
2. THE App SHALL use exactly one CSS file located in the css/ directory.
3. THE App SHALL use exactly one JavaScript file located in the js/ directory.
4. THE App SHALL function without a backend server and SHALL require no build step or installation process to run.
5. THE App SHALL be compatible with the latest stable release versions of Chrome, Firefox, Edge, and Safari available at the time of development, where "latest stable release" means the most recent non-beta, non-canary version published by each browser vendor.
6. WHERE a charting library is used for THE Pie_Chart, THE App SHALL load it via a CDN script tag and SHALL NOT require a package manager or local installation.

---

### Requirement 7: Performance and Visual Design

**User Story:** As a user, I want the app to load quickly and present information clearly, so that the experience feels smooth and effortless.

#### Acceptance Criteria

1. THE App SHALL complete initial render of all UI components within 3 seconds on a connection with a download speed of at least 10 Mbps.
2. WHEN the user submits the Input_Form, deletes a Transaction, or any action that updates the Transaction_List, Balance_Display, or Pie_Chart, THE App SHALL reflect the updated state within 300 milliseconds of the triggering interaction.
3. THE App SHALL apply consistent font sizing across all UI components, where body text is no smaller than 14px, labels are visually distinct from input values, and all interactive elements have a minimum touch/click target size of 44x44 pixels.
