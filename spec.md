# FacelessCreator

## Current State
The app requires Internet Identity login to access all dashboard pages. A `ProtectedRoute` component in `App.tsx` redirects unauthenticated users to `/login`. The `LoginPage` handles the Internet Identity flow. All backend calls pass the authenticated identity, and the backend enforces `#user` permission checks via `AccessControl`.

## Requested Changes (Diff)

### Add
- Nothing new.

### Modify
- `App.tsx`: Remove `ProtectedRoute` wrapper; all routes accessible directly. Redirect `/login` to `/dashboard`.
- All page components: Remove identity/auth checks. Switch to local `useState`+`localStorage` state so the app works without any login.
- `LandingPage.tsx`: Replace all login CTAs with direct `/dashboard` navigation.
- `Layout.tsx`: Remove identity/logout UI.

### Remove
- Login/registration flow (Internet Identity prompts).
- `ProtectedRoute` component.
- Auth guards in all page components.
- `LoginPage` (redirect to dashboard instead).

## Implementation Plan
1. Update `App.tsx`: remove `ProtectedRoute`, open all routes, redirect `/login` to `/dashboard`.
2. Update all page components to use local state (useState + localStorage) - no backend actor calls needed.
3. Update `LandingPage.tsx`: replace login CTAs with dashboard links.
4. Update `Layout.tsx`: remove identity/logout UI.
5. Validate and build.
