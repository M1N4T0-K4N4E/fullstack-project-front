# Tickale - Task List (Frontend Only)

## Project Overview
**Tickale** - Event Ticket Selling Platform

### Roles
- **User** - Buy tickets, manage own tickets
- **Organizer** - Create/manage own events, view tickets for their events
- **Admin** - Manage all events, all tickets, all users

### Tech Stack
- Framework: Next.js (App Router)
- UI: shadcn/ui + Tailwind CSS
- State: React hooks / Zustand / Context
- Forms: Formik + Zod
- Mock API: Next.js API Routes with in-memory/JSON data

---

## Authentication & Authorization

### Core Auth UI
- [ ] Login page with email/password form
- [ ] Register page with role selection (user/organizer)
- [ ] Logout functionality
- [ ] Session state management (Context/hooks)
- [ ] Protected routes based on role (middleware/hoc)

### Password & Security UI
- [ ] Password visibility toggle
- [ ] Password reset request form
- [ ] Password reset form with new password
- [ ] Email verification notice page

### Role-Based Access Control UI
- [ ] Role-based navigation menu
- [ ] Role-based page access (redirect unauthorized)
- [ ] Role badge/indicator in UI

---

## Event Management

### Event List Page
- [ ] Display all upcoming events
- [ ] Search events by name/title
- [ ] Filter by category (Concert, Workshop, Seminar, Sports, Festival, etc.)
- [ ] Filter by date range
- [ ] Filter by price range
- [ ] Sort by date, price, popularity
- [ ] Pagination or infinite scroll
- [ ] Event card showing: image, title, date, venue, price starting from, tickets left
- [ ] Loading skeletons during fetch
- [ ] Empty state when no events found

### Event Detail Page
- [ ] Event banner/image
- [ ] Event title, description, organizer name
- [ ] Date, time, venue/location
- [ ] Available ticket types (VIP, Regular, Early Bird)
- [ ] Price per ticket type
- [ ] Available seats/tickets count
- [ ] "Buy Tickets" CTA button
- [ ] Share event (copy link button)
- [ ] Back to events button

### Create/Edit Event Page (Organizer)
- [ ] Event creation form
  - Title, description, category dropdown
  - Banner/image upload UI (mock preview)
  - Start date/time picker, end date/time picker
  - Venue name, address fields
  - Ticket types configuration (dynamic add/remove)
    - Type name, price, quantity inputs
    - Early bird toggle with date range
  - Status selector: Draft / Published / Cancelled
- [ ] Edit existing event (pre-fill form)
- [ ] Delete event confirmation dialog
- [ ] Event analytics cards (views, tickets sold, revenue)

### Admin Event Management
- [ ] All events table/list view
- [ ] Search and filter events
- [ ] Approve/cancel event buttons
- [ ] Feature/unfeature toggle
- [ ] Delete event with confirmation

---

## Ticket System

### Buy Ticket Flow
- [ ] Ticket type selector (VIP, Regular, etc.)
- [ ] Quantity selector with +/- buttons (respect max limit)
- [ ] Price breakdown display (subtotal, fees, total)
- [ ] Booking summary modal/drawer
- [ ] Mock payment form (card inputs)
- [ ] Payment processing loading state
- [ ] Booking confirmation page
- [ ] Generate ticket with unique ticket ID
- [ ] Ticket QR code display (using qrcode library)
- [ ] Success/failure toast notification

### Ticket Types & Pricing UI
- [ ] Multiple ticket tier cards per event
- [ ] Early bird badge/indicator
- [ ] Discount badge for special offers
- [ ] Sold out indicator for tiers

### Ticket Detail Page
- [ ] Display ticket info: event name, date, venue, seat/type
- [ ] QR code display for verification
- [ ] Ticket status badge: Valid, Used, Cancelled, Refunded
- [ ] Download ticket button (html2canvas/dom-to-image)
- [ ] Share ticket button

### Ticket Management

#### User - Own Tickets
- [ ] List all purchased tickets
- [ ] Filter by status (upcoming, past, cancelled)
- [ ] Cancel/refund request button
- [ ] Cancel confirmation dialog
- [ ] Transfer ticket form (email input)
- [ ] Transfer confirmation dialog
- [ ] Download ticket button

#### Organizer - Own Event Tickets
- [ ] List all tickets for own events
- [ ] Filter by event, status, date
- [ ] Search by ticket ID or buyer name
- [ ] Check-in modal with QR scanner (html5-qrcode)
- [ ] Mark ticket as used/no-show buttons
- [ ] Cancel ticket button with refund option
- [ ] Export tickets button (CSV download)

#### Admin - All Tickets
- [ ] View all tickets table
- [ ] Filter by organizer, event, status
- [ ] Override ticket status dropdown
- [ ] Force cancel/refund button
- [ ] Refund requests tab/queue

---

## Account Management

### Update Account Page (All Roles)
- [ ] View profile information card
- [ ] Edit profile form:
  - Name input
  - Email input
  - Phone input
  - Profile picture upload (mock preview)
- [ ] Change password form
- [ ] Notification preferences toggles
- [ ] Save/Cancel buttons
- [ ] Success/error feedback

### Organizer Dashboard
- [ ] Overview cards: total events, tickets sold, revenue
- [ ] Quick stats with icons
- [ ] Recent activity feed
- [ ] Upcoming events quick links
- [ ] Quick create event button

### Admin Dashboard
- [ ] Platform stats cards
  - Total users count
  - Total events count
  - Total tickets sold
  - Total revenue
  - Pending refunds count
- [ ] Quick action buttons
- [ ] User management link
- [ ] Refund requests link
- [ ] Analytics placeholder (charts if time permits)

### User Management Page (Admin)
- [ ] Users table with pagination
- [ ] Search by name/email
- [ ] View user details modal
- [ ] Suspend/ban user toggle
- [ ] Change user role dropdown
- [ ] User role badges

---

## Forms & Validation

### Form Validation
- [ ] Required field validation
- [ ] Email format validation
- [ ] Phone number format validation
- [ ] Date validation (end > start)
- [ ] Price validation (positive numbers)
- [ ] Quantity validation (positive, max limit)
- [ ] Real-time validation feedback
- [ ] Form-level error messages

### Input Components
- [ ] Text input with label and error
- [ ] Select/dropdown with label and error
- [ ] Date picker with label and error
- [ ] Time picker with label and error
- [ ] File upload with preview
- [ ] Checkbox with label
- [ ] Radio group with label
- [ ] Textarea with character count

---

## UI/UX Components

### Layout Components
- [ ] Main layout with header and footer
- [ ] Role-based navigation sidebar or top nav
- [ ] Responsive sidebar (collapse on mobile)
- [ ] Container with max-width
- [ ] Page header with breadcrumbs

### Shared Components
- [ ] Button (primary, secondary, outline, ghost, destructive)
- [ ] Loading spinner
- [ ] Loading skeleton
- [ ] Toast notification (success, error, warning, info)
- [ ] Modal dialog
- [ ] Confirmation dialog
- [ ] Drawer/Slide-over panel
- [ ] Tabs component
- [ ] Badge/Chip
- [ ] Card component
- [ ] Avatar
- [ ] Data table with sorting/pagination
- [ ] Empty state component
- [ ] Error state component
- [ ] File preview

### Table Components
- [ ] Sortable columns
- [ ] Pagination controls
- [ ] Row selection (checkbox)
- [ ] Row actions menu
- [ ] Filter dropdowns in header

---

## Edge Cases & Error Handling

### UI Edge Cases
- [ ] Sold out event handling (disable buy button)
- [ ] Past event handling (hide buy, show "Event Ended")
- [ ] Cancelled event handling (show cancelled badge)
- [ ] Booking timeout warning (countdown)
- [ ] Double booking prevention (disable after purchase)
- [ ] Ticket already used handling (show used status)
- [ ] User already has ticket for event

### Error States UI
- [ ] Global error boundary
- [ ] 404 page for invalid routes
- [ ] 403 page for unauthorized access
- [ ] Network error retry UI
- [ ] Form submission error display
- [ ] API loading error fallback

### Empty States
- [ ] No events found
- [ ] No tickets found
- [ ] No search results
- [ ] No users (admin)

### Loading States
- [ ] Button loading state (disable + spinner)
- [ ] Page skeleton loading
- [ ] Table loading skeleton
- [ ] Card loading skeleton
- [ ] Image placeholder/skeleton

### Confirmation Dialogs
- [ ] Cancel ticket confirmation
- [ ] Delete event confirmation
- [ ] Transfer ticket confirmation
- [ ] Logout confirmation
- [ ] Discard changes confirmation

---

## Accessibility

- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Focus visible indicators
- [ ] ARIA labels on interactive elements
- [ ] Screen reader text
- [ ] Color contrast compliance
- [ ] Skip to content link
- [ ] Form field labels associated

---

## Responsive Design

- [ ] Mobile-first approach
- [ ] Hamburger menu on mobile
- [ ] Stack cards vertically on mobile
- [ ] Full-width forms on mobile
- [ ] Touch-friendly tap targets (min 44px)
- [ ] Responsive table (horizontal scroll or cards)

---

## Pages Structure

```
/                           → Landing/Redirect
/login                      → Login page
/register                   → Register page
/forgot-password            → Forgot password page
/reset-password             → Reset password page

/events                     → Event list page
/events/:id                 → Event detail page

/dashboard                  → Role-based dashboard
/dashboard/events           → Manage events list
/dashboard/events/create    → Create event page
/dashboard/events/:id/edit  → Edit event page

/dashboard/tickets          → Tickets list (role-based)
/dashboard/tickets/:id      → Ticket detail page

/dashboard/account          → Update account page

/admin                      → Admin dashboard
/admin/users                → User management page
/admin/events               → All events management
/admin/refunds              → Refund requests page
```

---

## Priority

### P0 - Must Have
1. Auth UI (login, register, logout)
2. Event list & detail pages
3. Buy ticket flow
4. Ticket detail page with QR
5. User dashboard with own tickets
6. Organizer: create/edit events, view event tickets
7. Admin: dashboard, user management

### P1 - Should Have
1. Search & filter events
2. Cancel/refund ticket
3. Check-in ticket QR scanner
4. Event analytics cards
5. Form validation
6. Loading skeletons
7. Toast notifications
8. Confirmation dialogs

### P2 - Nice to Have
1. Ticket transfer
2. Export tickets CSV
3. Event categories
4. Charts/analytics visualization
5. Advanced filters
6. Ticket PDF download
