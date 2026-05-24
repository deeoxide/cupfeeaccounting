# Frontend Hosting Providers

A guide to the best platforms for deploying modern frontend applications.

## 1. GitHub Pages (Best for Open Source/Prototypes)
- **Ideal for:** Single-file HTML prototypes or simple static sites.
- **How to deploy:**
  1. Push code to a GitHub repository.
  2. Go to **Settings > Pages**.
  3. Select the branch (e.g., `main`) and folder (e.g., `/root`).
  4. Your site will be live at `https://<username>.github.io/<repo-name>/`.

## 2. Netlify (Best for Fast Iteration)
- **Ideal for:** Projects that need custom domains and easy CI/CD.
- **How to deploy:**
  - **Drag & Drop:** Upload the folder directly to the Netlify dashboard.
  - **Git Sync:** Connect your GitHub/GitLab repo. Netlify will rebuild on every push.
- **Key Feature:** "Deploy Previews" allow you to see changes on a unique URL before merging.

## 3. Vercel (Best for React/Next.js)
- **Ideal for:** Highly performant React applications.
- **How to deploy:**
  1. Connect your GitHub repository.
  2. Vercel automatically detects the framework (e.g., Vite, React).
  3. Deploy in one click.
- **Key Feature:** Excellent integration with serverless functions if a small backend is needed.

## Deployment Checklist
- [ ] **Environment Variables:** Ensure any API keys (e.g., Anthropic) are moved to environment variables rather than hardcoded.
- [ ] **Build Command:** If using a build tool, verify `npm run build` works locally.
- [ ] **Base Path:** If deploying to a subfolder (like GitHub Pages), ensure asset paths are relative.
