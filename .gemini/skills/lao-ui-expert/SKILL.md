---
name: lao-ui-expert
description: Expert guidance for building and maintaining Lao-localized frontend applications using a React + Tailwind CDN stack. Use this skill when Gemini CLI needs to create new UI components, pages, or ensure style consistency for the Lao SME Accounting app or similar prototypes.
---

# Lao UI Expert

This skill helps you maintain consistency and speed up development for the Lao SME Accounting app and similar React/Tailwind/Lao projects.

## Core Principles

1.  **Lao First:** Always use Noto Sans Lao and ensure translations are natural for Lao accounting/business context.
2.  **No-Build Simplicity:** Stick to the single-file HTML pattern with Babel and Tailwind CDN unless explicitly instructed to migrate to a build system.
3.  **Clean Aesthetics:** Follow the "rounded-2xl + white background + blue primary" aesthetic.

## Usage Guide

### Ensuring Style Consistency
When adding new elements, refer to the [Style Guide](references/style-guide.md) for typography, colors, and general UI standards.

### Using Components
Don't reinvent the wheel. Use the patterns defined in the [Component Library](references/components.md) for:
- Stats Cards
- Forms and Inputs
- Buttons
- Navigation

### Localization
Always use the `lo-LA` locale for number formatting:
```javascript
new Intl.NumberFormat('lo-LA', { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 2 
}).format(value);
```

## Example Tasks

- "Add a new 'Settings' tab to the accounting app."
- "Create a reusable 'Modal' component that matches the current theme."
- "Fix the font weight on all Lao headers to be 'bold'."
