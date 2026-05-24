# Lao UI Style Guide

This guide defines the standards for building Lao-localized web applications using the React + Tailwind (CDN) + Babel "no-build" stack.

## Tech Stack

- **React:** 18.2.0 (via esm.sh)
- **Tailwind CSS:** CDN version
- **Icons:** Lucide React (via esm.sh)
- **Transpilation:** Babel Standalone (in-browser)

## Typography

Always use **Noto Sans Lao** for Lao text.

```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@300;400;500;600;700;900&display=swap" rel="stylesheet">
```

### Tailwind Configuration

Ensure the font is set as the default sans-serif font:

```javascript
tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Noto Sans Lao"', 'sans-serif'],
            }
        }
    }
}
```

## Color Palette

| Usage | Tailwind Class | Hex (approx) |
| :--- | :--- | :--- |
| **Primary** | `blue-600` | `#2563EB` |
| **Background** | `bg-[#F8FAFC]` | `#F8FAFC` |
| **Borders** | `border-gray-100` / `gray-200` | - |
| **Success/Income** | `text-green-600` | `#16A34A` |
| **Danger/Expense** | `text-red-600` | `#DC2626` |
| **Card Background** | `bg-white` | `#FFFFFF` |

## UI Standards

- **Rounded Corners:** Use `rounded-xl` for buttons and `rounded-2xl` for cards/containers.
- **Shadows:** Use `shadow-sm` for standard cards and `shadow-md` or `shadow-lg` for modals/important elements.
- **Spacing:** Use consistent padding (e.g., `p-6` for cards, `py-3.5` for buttons).
- **Animations:** Use a simple "fade-in" for new views:
  ```css
  .fade-in { animation: fadeIn 0.3s ease-in-out; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  ```
