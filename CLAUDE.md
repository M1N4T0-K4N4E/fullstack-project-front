@AGENTS.md

# Tickale - Frontend Project

## Project Overview
- **Project Name**: Tickale - Event Ticket Selling Platform
- **Type**: Next.js App Router frontend with mock API
- **Purpose**: Event ticketing system with User, Organizer, and Admin roles

## Tech Stack
- Framework: Next.js 14+ (App Router)
- UI: shadcn/ui + Tailwind CSS
- State: Zustand (global), React hooks (local)
- Forms: Formik + Zod validation
- Mock API: Next.js API Routes with in-memory data

## Key Commands
```bash
yarn dev          # Start development server
yarn build        # Build for production
yarn lint         # Run ESLint
```

## Project Structure
```
src/
├── app/           # Next.js App Router pages
├── components/
│   ├── ui/        # shadcn/ui components
│   ├── forms/     # Form components
│   └── shared/    # Shared components
├── hooks/         # Custom React hooks
├── lib/           # Utilities, API client
├── store/         # Zustand stores
└── types/         # TypeScript types
```

## Important Conventions
- Components: PascalCase.tsx
- Hooks: camelCase.ts with `use` prefix
- All components use TypeScript
- Use shadcn/ui components as base, customize via Tailwind

## Priority Order
1. Auth (P0) - Login, register, protected routes
2. Events (P0) - List, detail, create/edit
3. Tickets (P0) - Buy flow, QR code, detail
4. Dashboards (P0) - User, Organizer, Admin
5. Polish (P1) - Validation, loading states, toasts
