---
name: website-architect
description: Expert guidance for designing web application architecture, including state management strategies, data flow patterns, and responsive UI/UX layouts. Use this skill when Gemini CLI needs to plan the structure of a new project, refactor existing code for scalability, or design complex navigation systems.
---

# Website Architect

This skill helps you design robust, scalable, and intuitive web applications.

## Core Mandates

1.  **Scalability:** Always consider how a solution will perform as data and feature complexity grows.
2.  **Consistency:** Ensure navigation and data patterns are predictable throughout the application.
3.  **Simplicity:** Prefer the simplest state management tier that solves the problem.

## Architectural Guidance

### State & Data Flow
When asked to design data management, refer to the [State Management Guide](references/state-management.md). Prioritize "Single Source of Truth" and derived state over redundant state variables.

### Navigation & Layout
For planning the user interface, refer to [Navigation Patterns](references/navigation-patterns.md). Choose the layout (Sidebar vs. Top Nav) based on the number of features and the primary device type.

## Example Tasks

- "How should I structure my React app to handle 20+ different accounting forms?"
- "Design a state management plan for a real-time collaborative editor."
- "Suggest a responsive layout for a complex data-entry dashboard."
- "Explain the pros and cons of using Context API vs. Zustand for this project."
