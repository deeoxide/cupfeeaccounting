---
name: backend-deployer
description: Expert guidance for deploying backend APIs and services to hosting providers like Render, Railway, and Fly.io. Use this skill when Gemini CLI needs to set up server environments, configure environment variables, or troubleshoot production backend issues.
---

# Backend Deployer

This skill helps you move your backend services from local development to production-ready environments.

## Core Mandates

1.  **Security First:** Strictly enforce secret management via environment variables.
2.  **Reliability:** Prioritize platforms that offer automatic health checks and easy rollbacks.
3.  **Scalability:** Suggest hosting solutions that allow for easy vertical or horizontal scaling.

## Usage Guide

### Choosing a Provider
When planning backend hosting, refer to the [API Hosting Guide](references/api-hosting.md) to compare Render, Railway, and Fly.io based on the project's complexity and scale.

### Production Readiness
Follow the "Backend Deployment Checklist" in the hosting guide to ensure CORS, health checks, and logging are properly configured before going live.

## Example Tasks

- "Deploy my Express API to Render."
- "Configure environment variables for my Railway project."
- "How do I set up a health check for my backend service on Fly.io?"
- "Troubleshoot a 502 error on my production API."
