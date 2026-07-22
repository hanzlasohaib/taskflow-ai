# Cursor Prompt — Generate `docs/PLAN.md`

# ROLE

You are a Senior Software Architect, Senior Full Stack Engineer, Mobile Architect, Desktop Architect, Solutions Architect, and Technical Product Manager.

Your responsibility is to design a production-ready, cross-platform application before any implementation begins.

Your job is **NOT** to write source code.

Your task is to analyze the project requirements and generate a comprehensive planning document located at:

```text
docs/PLAN.md
```

This document will become the **single source of truth** for the entire project.

---

# RULES

Do **NOT** generate source code.

You **MAY** define and describe:

* Overall architecture
* Monorepo structure
* Folder structure
* Pages
* Routes
* Components
* API endpoints
* Database schema
* Authentication flow
* Application flow
* UI architecture
* Design system
* State management
* Cross-platform architecture
* Development phases
* Deployment architecture
* Coding standards
* Documentation standards

Only describe architecture and planning.

Do **NOT** generate implementation.

Do **NOT** create any files except:

```text
docs/PLAN.md
```

---

# PROJECT

Build a modern, production-ready, AI-powered, cross-platform Task Management application.

The project must satisfy the Dafi Labs MERN Stack Internship Session 2 Weekly Assignment while following modern software engineering best practices.

The application should remain intentionally simple while demonstrating all required concepts.

---

# ASSIGNMENT REQUIREMENTS

The project must include:

* Next.js Web Application
* Authentication
* Email Verification
* Welcome Email
* Google reCAPTCHA
* Task CRUD
* Supabase Database
* Prisma ORM
* Supabase Realtime
* HTML Canvas Feature
* Chrome Extension
* Android Application (React Native with Expo)
* Desktop Application (Tauri)
* Deployment on Vercel
* Public GitHub Repository

---

# ADDITIONAL PROJECT FEATURES

Include planning for:

* Dark & Light Theme
* Responsive Design
* AI Voice Task Creation using Deepgram
* Modern SaaS Dashboard
* Statistics Cards
* Search
* Filtering
* User Profile
* Settings
* Production-ready architecture

---

# PRIMARY GOAL

Generate **only** the contents of:

```text
docs/PLAN.md
```

The generated document must be detailed enough that the complete project can be implemented phase-by-phase without redesigning the architecture.

---

# TECH STACK

## Frontend

* Next.js (Latest)
* React 19
* App Router
* TypeScript
* Tailwind CSS v4
* shadcn/ui
* Radix UI
* Lucide React
* Framer Motion
* next-themes

## Backend

* Next.js Route Handlers
* Server Actions where appropriate

## Database

* Supabase PostgreSQL

## ORM

* Prisma

## Authentication

* Better Auth
* Resend
* Google reCAPTCHA

## Validation

* Zod
* React Hook Form

## AI

* Deepgram Speech-to-Text

## Mobile

* React Native
* Expo (Latest)
* TypeScript

## Desktop

* Tauri

## Browser

* Chrome Extension (Manifest V3)

## Deployment

* Vercel

---

# PROJECT STRUCTURE

Design the project as a **single monorepo**.

Plan a scalable structure similar to:

```text
docs/
apps/
packages/
```

Include planning for:

```text
apps/
    web/
    mobile/          # Expo React Native
    desktop/         # Tauri
    extension/       # Chrome Extension

packages/
    ui/
    types/
    utils/
    validation/
    config/
```

The architecture should prioritize maintainability, scalability, and code reuse.

---

# DEVELOPMENT PHASES

Organize the implementation into logical phases.

Example:

Phase 1 — Project Setup

Phase 2 — Authentication

Phase 3 — Dashboard

Phase 4 — Task CRUD

Phase 5 — Realtime

Phase 6 — Voice Tasks (Deepgram)

Phase 7 — HTML Canvas

Phase 8 — Chrome Extension

Phase 9 — Mobile App (Expo React Native)

Phase 10 — Desktop App (Tauri)

Phase 11 — Deployment

Phase 12 — Testing

Phase 13 — Final Submission

Every phase should include:

* Goal
* Deliverables
* Dependencies
* Success Criteria
* Risks

---

# REQUIRED SECTIONS

The generated PLAN.md must contain at least:

1. Project Overview

2. Project Vision

3. Project Goals

4. Tech Stack

5. High-Level Architecture

6. Monorepo Structure

7. Folder Structure

8. Database Design

9. Prisma Schema Planning

10. Authentication Flow

11. User Journey

12. Application Flow

13. Routing Strategy

14. API Design

* Describe every endpoint.
* Do not implement them.

15. Realtime Strategy

Explain:

* Why Supabase Realtime
* Connection lifecycle
* Subscriptions
* Presence
* Broadcast
* Database events
* Best practices
* Vercel considerations

16. AI Integration

Deepgram

Explain:

* Purpose
* Architecture
* User flow
* Security
* Future enhancements

17. HTML Canvas Strategy

Explain:

* Feature
* Purpose
* User flow
* Integration

18. Chrome Extension Plan

Include:

* Purpose
* Architecture
* Features
* Authentication
* Communication with the web application

19. Mobile Application (Expo React Native)

Include:

* Expo architecture
* Expo Router / navigation strategy
* Shared backend
* Authentication
* API usage
* Shared business logic where appropriate

20. Desktop Application (Tauri)

Include:

* Architecture
* Shared backend
* Authentication
* API usage

21. UI / UX Planning

Describe every screen:

* Landing
* Login
* Signup
* Forgot Password
* Dashboard
* Task Management
* Profile
* Settings

22. Component Inventory

List all reusable components.

23. Design System

Include:

* Color palette
* Typography
* Spacing
* Border radius
* Shadows
* Icons
* Animations
* Dark Theme
* Light Theme
* Accessibility

24. State Management Strategy

Explain:

* Server state
* Client state
* Form state
* Theme state

25. Environment Variables

List every required environment variable.

26. Error Handling Strategy

Cover:

* Authentication
* Validation
* API
* Database
* Realtime
* AI services
* Network failures

27. Security Checklist

Include:

* Authentication
* Authorization
* API security
* Environment variables
* SQL injection prevention
* XSS prevention
* CSRF protection
* Rate limiting

28. Performance Strategy

29. Deployment Strategy

30. Testing Strategy

Include:

* Unit testing
* Integration testing
* Manual testing
* Cross-platform testing

31. Loom Demonstration Checklist

32. Future Improvements

33. Architecture Decision Records (ADR)

For every major technology decision explain:

* Why it was chosen
* Alternatives considered
* Pros
* Cons

---

# CROSS-PLATFORM PRINCIPLES

The following applications must share the same backend:

* Next.js Web
* Expo React Native
* Tauri Desktop
* Chrome Extension

Use one Supabase project.

Use one PostgreSQL database.

Use one authentication system.

Reuse validation schemas, business logic, and TypeScript types whenever practical.

Maintain a consistent user experience across platforms while respecting platform-specific UI conventions.

Avoid unnecessary duplication.

---

# CODING STANDARDS

Define standards for:

* Naming conventions
* Folder naming
* File naming
* Components
* Hooks
* APIs
* Prisma
* TypeScript
* Git commits
* Branching strategy

---

# DOCUMENTATION STANDARDS

Every architectural decision should include:

* Purpose
* Benefits
* Trade-offs
* Alternatives
* Future scalability

---

# DEVELOPMENT PRINCIPLES

* Build production-quality architecture.
* Keep the application intentionally simple.
* Avoid overengineering.
* Prefer modular design.
* Prefer reusable components.
* Prefer Server Components where appropriate.
* Prefer Server Actions where appropriate.
* Use strict TypeScript.
* Accessibility first.
* Responsive by default.
* Performance conscious.
* Security first.
* Design for future scalability.

---

# OUTPUT

Generate **only** the contents of:

```text
docs/PLAN.md
```

Use professional Markdown formatting.

Use headings, tables, diagrams (where appropriate), and checklists.

Do not generate source code.

Do not generate any additional files.

The resulting PLAN.md should be comprehensive enough to guide implementation from project setup through deployment without requiring architectural redesign.
