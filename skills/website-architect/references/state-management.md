# State & Data Architecture Patterns

This guide provides strategies for managing data flow and state in React-based web applications.

## State Management Tiers

### 1. Local Component State (`useState`)
Best for UI-only state (modals, form inputs, local toggles).
- **Rule:** If the state is only used by one component and its immediate children, keep it local.

### 2. Lifted State
Pass state and setters via props.
- **Rule:** Use when 2-3 components need to share the same data. Avoid "prop drilling" (passing through >3 layers).

### 3. Context API
Best for "global" but rarely changing data (Auth user, Theme, Localization).
- **Pattern:** Use a Provider at the root.
```jsx
const UserContext = React.createContext();
function App() {
  const [user, setUser] = useState(null);
  return (
    <UserContext.Provider value={{user, setUser}}>
      <Main />
    </UserContext.Provider>
  );
}
```

### 4. External Stores (e.g., Zustand)
Recommended for complex, frequently updated data (Accounting journals, shopping carts).
- **Why:** Better performance than Context for frequent updates, simpler than Redux.

## Data Fetching & Sync

- **Patterns:**
  - **Optimistic Updates:** Update the UI immediately, then sync with the API.
  - **Polling:** Regularly fetch data for "live" dashboards.
  - **Caching:** Store API results to avoid redundant network calls.

## Accounting Specific Patterns (from SME App)
- **Derived State:** Calculate totals (Assets, Profits) in `useMemo` based on the raw journal entries rather than storing them in state. This ensures "Single Source of Truth".
