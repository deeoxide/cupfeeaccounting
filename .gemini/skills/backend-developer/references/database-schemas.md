# Database Schema Design (Accounting)

Standard schema for double-entry bookkeeping and SME financial management.

## 1. Accounts Table
Stores the chart of accounts.
- `id` (UUID/Int): Primary Key.
- `code` (String): e.g., "1001", "4001".
- `name` (String): e.g., "Cash", "Sales".
- `type` (Enum): `ASSET`, `LIABILITY`, `EQUITY`, `REVENUE`, `EXPENSE`.
- `normal_balance` (Enum): `DR`, `CR`.
- `opening_balance` (Decimal).

## 2. Journals Table
Stores the header information for a transaction.
- `id` (UUID): Primary Key.
- `date` (Date).
- `note` (String).
- `reference_no` (String): e.g., Invoice # or Slip ID.
- `created_at` (Timestamp).

## 3. Journal Entries Table
The "legs" of the transaction (Double-entry).
- `id` (UUID): Primary Key.
- `journal_id` (UUID): Foreign Key to Journals.
- `account_id` (UUID): Foreign Key to Accounts.
- `debit` (Decimal).
- `credit` (Decimal).
- `description` (String): Optional line-item note.

## Integrity Rules
- **Balance Rule:** For any `journal_id`, the sum of `debit` must equal the sum of `credit`.
- **Atomic Transactions:** Always wrap journal and its entries in a database transaction to ensure data integrity.
- **Immutability:** Financial records should rarely be deleted. Use "Void" flags or reversing entries instead.
