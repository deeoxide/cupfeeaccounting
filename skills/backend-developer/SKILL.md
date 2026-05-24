---
name: backend-developer
description: Expert guidance for designing and implementing backend systems, including RESTful API design, database schema architecture (SQL/NoSQL), and financial data integrity. Use this skill when Gemini CLI needs to build API endpoints, design database tables, or ensure backend security for the SME Accounting app.
---

# Backend Developer

This skill helps you build solid, secure, and high-performance backend systems.

## Core Principles

1.  **Data Integrity First:** Especially for financial apps, ensure double-entry rules are enforced at the database/API level.
2.  **RESTful Clarity:** Keep API endpoints predictable and well-documented.
3.  **Security by Design:** Validate all inputs, use parameterized queries, and enforce authentication.

## Usage Guide

### API Design
When designing endpoints, refer to [API Design Standards](references/api-standards.md) for naming conventions and response formats.

### Database Architecture
For designing tables and relationships, refer to [Database Schema Design](references/database-schemas.md). Pay special attention to the "Integrity Rules" for accounting data.

## Example Tasks

- "Design a set of REST endpoints for managing inventory and sales."
- "Create a PostgreSQL schema for a multi-currency accounting system."
- "Implement a validation layer for incoming journal entries to ensure they balance."
- "Suggest an indexing strategy for a transactions table with millions of rows."
