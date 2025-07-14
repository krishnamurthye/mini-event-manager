# Mini Event Manager - System Architecture Documentation

## Overview

The **Mini Event Manager** is a lightweight  robust web application designed to help users create, manage, and collaborate around events. It supports user registration, authentication, attendee tracking, and flexible tagging  all through a modern and secure GraphQL API.
  
This document outlines the target architecture for the Mini Event Manager system and how it is intended to evolve into a scalable, maintainable, and production-ready platform. While the current version implements only core features with basic architectural scaffolding, the design choices reflect patterns that can support long-term scalability and extensibility.

---

## High-Level Architecture Diagram

```mermaid
graph TD
  A[Client (Next.js + React)] --> B[Apollo Server (GraphQL Gateway)]
  B --> C[Business Logic Layer<br>(Resolvers, Middleware, Validation)]
  C --> D[Data Access Layer<br>(Prisma + PostgreSQL)]
  C --> E[Redis Cache]
  C --> F[External Services (Email, Auth)]
  B --> G[Observability (Telemetry, Logs)]
```

---

## Core Modules

### 1. Authentication & Authorization

* JWT-based auth with access and refresh tokens
* OAuth 2.0 support via Passport.js (Google, GitHub)
* Role-Based Access Control (RBAC)
* Password Security:

  * **Client-side SHA256(password salted with email)**
    * **Server-side bcrypt(SHA256)**
    * Replay-safe, hash-leak resilient
* Middleware to enforce authentication & roles

### 2. Event Management

* Create, update, delete, and view events
* Attributes: title, date, tags, creator, attendees
* Visibility: public or private
* Ownership enforced via middleware

### 3. Tag System

* Fully normalized `Tag` and `TagCategory`
* Reusable across events
* Real-time search with debounce & de-duplication

### 4. Attendee Management

* Linked via join table with RSVP status enum
* Prevents duplicate by email
* Allows RSVPs from both users and external guests

---

## Technology Stack

| Layer            | Technology               |
| ---------------- | ------------------------ |
| Frontend         | Next.js, Tailwind CSS    |
| API Gateway      | Apollo Server (GraphQL)  |
| Backend Language | Node.js + TypeScript     |
| Validation       | Zod, Custom Middleware   |
| Auth             | JWT, Passport.js, bcrypt |
| ORM              | Prisma                   |
| Database         | PostgreSQL               |
| Caching          | Redis                    |
| Observability    | OpenTelemetry, Sentry    |
| Testing          | Jest, Supertest          |
| CI/CD            | GitHub Actions           |

---

## Project Folder Structure (Simplified)

```text
/mini-event-manager
├── /app                   # Next.js app pages and routes
├── /components            # Reusable React components
├── /graphql
│   ├── /schemas           # GraphQL SDL files per domain
│   ├── /resolvers         # Resolver logic split by feature
│   ├── /middleware        # Auth, validation, error middleware
├── /lib                   # Utility functions (e.g., hashing, logging)
├── /prisma                # Prisma schema and migrations
├── /tests                 # Jest + Supertest test files
├── /scripts               # Seeders and setup scripts
├── .env                   # Environment configuration
└── Dockerfile             # Containerization config
```

This structure supports clean separation of concerns, a domain-driven architecture, and scalability-friendly organization.

---

## Non-Functional Requirements (NFRs)

| Category        | Details                                                       |
| --------------- | ------------------------------------------------------------- |
| Security        | End-to-end encryption, RBAC, hash-hardened auth, token expiry |
| Availability    | 99.9% uptime target via stateless API & cloud infrastructure  |
| Scalability     | Horizontally scalable APIs and cache-enabled tag search       |
| Observability   | Correlation IDs, tracing, error monitoring                    |
| Performance     | Sub-100ms tag search, batched GraphQL operations              |
| Maintainability | Modular resolvers, codegen, CI lint/test coverage             |
| Extensibility   | Plugin-friendly, schema-validated, service-driven design      |

---

## GraphQL API Design

* Modular schema by domain (`event`, `user`, `tag`, `auth`)
* Middleware stack:

    * Zod-based input validation
    * Authorization guard
    * Custom error normalization
* Context injects `userId`, `correlationId`, and `role`

Example (simplified):

```graphql
type Mutation {
  createEvent(input: CreateEventInput!): Event
}

type Event {
  id: ID!
  title: String!
  date: String!
  tags: [Tag!]!
}
```

---

## Data Flow: Create Event (Use Case)

### Scenario: User creates a new event with selected tags

```mermaid
graph TD
  A[User on Client] --> B[Submit Form: CreateEvent Mutation]
  B --> C[Apollo Server (GraphQL)]
  C --> D[Auth Middleware: requireAuth]
  D --> E[Validation Middleware: zod schema]
  E --> F[Resolver: createEvent()]
  F --> G[Tag Lookup/Insert (with deduplication)]
  G --> H[Prisma: Insert Event + Link Tags]
  H --> I[PostgreSQL DB]
  F --> J[Emit Observability Event (log + trace)]
  F --> K[Return Event Payload]
  K --> A
```

### Key Flow Highlights

* Auth and validation middleware wrap the resolver
* Tags are normalized: looked up by name or created if new
* Prisma transaction ensures atomic event+tags insert
* Logs and traces include correlationId for debugging

---

## Deployment Strategy

* Dockerized services (API, Frontend, DB)
* GitHub Actions:

    * Lint, test, type check, build Docker image
    * Push to container registry
    * Deploy to Fly.io / Render
* Environment via `.env` + validation
* Infrastructure-as-Code (Terraform / Pulumi)

---

## CI/CD Pipeline

* **Trigger**: Push to main or PR
* **Steps**:

    1. Install dependencies
    2. Run linter + Prettier
    3. Type check with `tsc`
    4. Run Jest and Supertest
    5. Build Docker image
    6. Deploy to staging or prod

---

## Observability & Resilience

* Structured logging with correlation IDs (Winston)
* Tracing with OpenTelemetry
* Metrics via Prometheus exporter
* Errors captured via Sentry
* Typed error classes (ValidationError, NotFoundError, UnauthorizedError)

---

## Access Control Matrix

| Action              | User      | Attendee | Anonymous |
| ------------------- | --------- | -------- | --------- |
| Register            | ✅         | ❌        | ✅         |
| Login               | ✅         | ❌        | ✅         |
| View Public Events  | ✅         | ✅        | ✅         |
| View Private Events | ✅ (owner) | ❌        | ❌         |
| Create Events       | ✅         | ❌        | ❌         |
| RSVP to Event       | ✅         | ✅        | ❌         |
| Edit/Delete Event   | ✅ (owner) | ❌        | ❌         |

---

## Data Modeling Strategy

* **Normalized, identity-centered schema**:

    * `Person`: shared identity for `User` and `Attendee`
    * `User`: registered system user
    * `Attendee`: invited guest (not always registered)
* `Event` ⇔ `Tag`: many-to-many via join table
* RSVP: Enum (`YES`, `NO`, `MAYBE`)

---

## Design Decisions & Tradeoffs

| Area                  | Decision                                                                   | Justification                                                     |
| --------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| API Style             | GraphQL                                                                    | Declarative, client-driven, schema-typed                          |
| Auth Strategy         | Double hash (SHA256 + bcrypt)                                              | Defense-in-depth, prevents replay attacks                         |
| Attendee Model        | Separate from User                                                         | Allows RSVP from non-users                                        |
| ORM                   | Prisma                                                                     | Type-safe, declarative migration support                          |
| Error Handling        | Typed + formatError hook                                                   | Structured UX & logs                                              |
| Validation            | Zod schemas + middleware                                                   | Centralized input checking                                        |
| Middleware Pattern    | Auth, validation, and ownership logic as middleware                        | Keeps resolvers clean and encourages reuse                        |
| Caching Strategy      | Redis for tag search and future rate limiting                              | Improves performance and enables scalable control mechanisms      |
| Context Injection     | Injects userId, role, correlationId into context                           | Enables auth checks and observability with minimal boilerplate    |
| Deployment            | Docker + GitHub Actions + platform (Fly.io, Render)                        | Portable and automatable with CI/CD-ready structure               |
| Schema Normalization  | Identity-first (Person, User, Attendee) model                              | Enables unified handling of people across use cases               |
| Error Normalization   | formatError() hook on Apollo server                                        | Delivers consistent client UX and structured logging              |
| Observability         | OpenTelemetry + Sentry + Winston                                           | End-to-end tracing and error tracking for production environments |
| External Auth Support | OAuth 2.0 via Passport.js (Google, GitHub)                                 | Enables frictionless onboarding and federated identity support    |
| Layered Architecture  | Separation of concerns via middleware, resolvers, context, and data layers | Improves maintainability, testability, and modular evolution      |
| Testing Strategy      | Integration tests via Jest & Supertest for key flows                       | Validates end-to-end resolver correctness and API boundaries      |

---

## Integration & Extensibility Hooks

The system is designed with extensibility in mind to support real-world integrations as it matures.

- **OAuth 2.0** via Passport.js (Google, GitHub) for federated identity
- **Planned (future) integrations**:
    - Email delivery (e.g., SendGrid or Resend)
    - Calendar sync (Google Calendar, iCal export)
    - Webhook subscriptions for event changes (for third-party automation)


## Microservice Boundary Considerations

While currently monolithic, the following service boundaries are anticipated:

* **Auth Service**: Handles JWT issuance, OAuth, refresh logic
* **Event Service**: Owns event creation, updates, and tagging
* **Notification Service**: Sends email or other user communications

These boundaries are defined to enable future federation and team-scale development.

## Security Considerations

* JWT expiry and refresh logic (planned)
* Secure password storage (SHA256 + bcrypt layering)
* Rate limiting on login and mutation endpoints (planned via Redis)
* CORS enforcement and headers via Helmet
* CSRF resilience for mutation forms

## API Versioning Approach

* Breaking field changes use deprecation and optional migration helpers
* GraphQL schema follows semantic naming (`v1_user`, `v2_event` optional)
* Apollo tooling supports field-level version tracking

## Rate Limiting Strategy

* Redis-based token bucket rate limiting (planned)
* Middleware layer for mutation frequency controls
* Useful for auth brute-force defense and abuse prevention

## Testing Philosophy

The system follows a balanced test strategy:
- **Unit tests** for isolated logic (validators, middleware, auth utils)
- **Integration tests** for API flows using Supertest & test servers
- **End-to-end test capability** is scaffolded for future UI automation
- Tests are run in CI for PR validation and release confidence


## Future Enhancements

* PostgreSQL-backed persistence (currently in-memory)
* Email notifications for RSVP/confirmation
* Rate limiting with Redis token bucket
* GraphQL Federation-ready (auth/events split)
* File upload for event banners
* Multi-tenant support (per-org schema or row-level isolation)
* Audit log & event sourcing framework

---

## Glossary

* **RBAC**: Role-Based Access Control
* **JWT**: JSON Web Token for auth
* **Zod**: Runtime validation library
* **Correlation ID**: Unique request ID for tracing

---

## Architectural Readiness Summary

The Mini Event Manager demonstrates a production-grade architecture even in prototype form:

*  Clean modular boundaries
*  Secure-by-default (client-server double hashing, RBAC)
*  Schema-validated inputs and outputs
*  Strong observability (logs, traces, error handling)
*  Scalable design (Redis, stateless API)
*  CI/CD integration and future-proofing

The current codebase implements a minimal MVP, but is architecturally poised for rapid growth and enterprise deployment.
