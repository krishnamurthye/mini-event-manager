# NOTES.md - (Work in progress)

# Assumptions & Known Issues

This document lists key assumptions made during development and any known limitations or bugs.

---

## Assumptions

1. Person-Centric Identity Model
    - A single `Person` entity is reused across both `User` (registered user) and `Attendee` (invited participant).
    - A `Person` can play both roles simultaneously.

2. **Authentication**
    - Passwords are securely hashed and stored.
    - JWT-based authentication is assumed for session handling.

3. **Event Visibility & Status**
    - `EventStatus` and `EventVisibility` are enforced during creation and listing.
    - `DRAFT` events are not publicly listed.
    - `CANCELLED` events are visible but read-only.

4. **Tags & Categories**
    - Tags are normalized and grouped by optional `TagCategory`.
    - Tag search is implemented via prefix/LIKE search.

5. **RSVP Model**
    - RSVP status is limited to `GOING`, `MAYBE`, or `DECLINED`.
    - Each attendee can RSVP to a single event only once.

6. **Event Time Validation**
    - The app enforces `startTime < endTime` at validation level (UI + server).

7. **Admin Roles (optional)**
    - Role support (e.g., `ADMIN`) is included for future moderation.

---

## Known Issues

1. **No Pagination Yet**
    - Event and attendee lists are not yet paginated (can be slow for large datasets).

2. **No Email Validation**
    - Email format is validated, but email verification (via OTP or magic link) is not implemented.

3. **Limited Form Validation**
    - Form validation relies on Formik + Yup but could be extended for richer UX.

4. **Rate Limiting / Abuse Prevention**
    - Rate limiting and brute-force protection are assumed but not fully implemented.

5. **No File Uploads**
    - Event banners/images are not supported in the current version.

---

## Future Enhancements

- Role-based access control (RBAC)
- Event comments/chat
- Tag/category management UI
- Soft deletes and audit logging
- Public API access via API keys
- Configurable Ports
    - The backend (`GraphQL API`) and frontend (`Next.js`) servers are configurable via environment variables.
        - Example:
            - Backend: `http://localhost:4000`
            - Frontend: `http://localhost:3000`
    - You can change ports via `.env` or run scripts.

---
