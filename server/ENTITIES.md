# ENTITIES.md - Mini Event Manager

This document outlines the data model for the Mini Event Manager app, including entity definitions, attributes,
relationships, constraints, indexing strategies, and assumptions.

---

## Person

Central entity to store identity information shared across users and attendees.

| Attribute   | Type   | Description                    |
|-------------|--------|--------------------------------|
| `id`        | ID     | Unique identifier (UUID)       |
| `name`      | String | full name                      |
| `email`     | String | email address                  |
| `createdAt` | String | ISO timestamp of user creation |

### Constraints

* `id` is primary key.

* `email` is optional but should be unique if provided.

### Indexes

* `id` (PK)
* `email` (UNIQUE if present)

## User Table

Represents a registered user who can create and manage events.

| Attribute        | Type    | Description                                                    |
|------------------|---------|----------------------------------------------------------------|
| `id`             | ID      | Unique identifier (UUID)                                       |
| `personId`       | ID      | Reference to Person.id (1:1)                                   |
| `password`       | String  | Secure hashed password                                         |
| `lastLoginAt`    | String  | ISO timestamp of the most recent successful login              |
| `failedAttempts` | Integer | Number of failed login attempts (can be reset on success)      |
| `isBlocked`      | Boolean | Whether the account is blocked (by admin or automated lockout) |
| `blockReason`    | String  | Optional reason why the user was blocked                       |
| `role`           | Enum    | Optional: USER, ADMIN, etc.                                    |

### Constraints

* `id` is primary key.
* `personId` is unique and references Person.
* `password` is required.
* `isBlocked` defaults to `false`.

### Indexes

* `id` (PK)
* `personId` (UNIQUE)
* `lastLoginAt` (for recent user queries)
* `isBlocked` (for admin/monitoring filters)

---

## UserPasswordHistory

| Attribute      | Type   | Description                |
|----------------|--------|----------------------------|
| `id`           | ID     | UUID                       |
| `userId`       | ID     | Foreign key to User        |
| `passwordHash` | String | Hashed password            |
| `createdAt`    | String | When this password was set |

## Data Model: Person–User–Attendee Relationship

              +-------------------+
              |     Person        |
              |-------------------|
              | id                |
              | name              |
              | email (optional)  |
              | createdAt         |
              +-------------------+
                    ▲       ▲
                    |       |
          +---------+       +-----------+
          |                             |
      +---+----+                   +----+------+
      |  User   |                  |  Attendee  |
      +--------+                  +------------+
      | id     |                  | id         |
      | personId|                 | personId   |
      | password|                 | eventId    |
      | ...     |                 | rsvpStatus |
      +--------+                  +------------+

### Identity and Role Modeling

In this system, identity is separated from behavior using a normalized data model:

    Person: The core identity entity that stores a name, email (optional), and creation timestamp.

    User: A registered person who can log in and create/manage events (i.e., authenticated system users).

    Attendee: A person invited to or attending an event, regardless of whether they are a registered user.

#### Why We Don't Use a Single "Role" Table

While it may seem simpler to use a single table with a "type" column (e.g., CREATOR or ATTENDEE), this design doesn't
reflect real-world usage:

    A User can also be an Attendee — e.g., someone creates Event A and RSVP's to Event B.

    These behaviors are distinct and involve separate foreign key relationships:

        Event.creatorId → User.id

        Attendee.personId → Person.id

Using distinct tables provides greater flexibility, clarity, and normalization.

#### Final Model

Role Table References Description
Identity Person — Shared profile info (name, email, etc.)
User User personId Can log in and create/manage events
Attendee Attendee personId Can RSVP to and attend specific events

#### Benefits of This Design

    * Identity reuse across roles

    * Multiple roles per person (e.g., user + attendee)

    * Clean normalization with minimal duplication

    * Scalability and auditability for future enhancements

#### Example Scenario

One Person:

    Is a User (they created Event A)

    Is also an Attendee (they RSVP'd GOING to Event B)

* No duplication
* Full traceability
* Role-based logic is cleanly enforced

## Event

Represents an event created by a user.

| Attribute     | Type            | Description                         |
|---------------|-----------------|-------------------------------------|
| `id`          | ID              | Unique identifier                   |
| `title`       | String          | Title of the event                  |
| `date`        | String          | ISO string (start time)             |
| `endTime`     | String          | ISO string (end time)               |
| `description` | String          | Optional description of the event   |
| `creatorId`   | ID              | Reference to `User.id`              |
| `tags`        | \[Tag]          | Tags associated with the event      |
| `attendees`   | \[Attendee]     | People attending this event         |
| `visibility`  | EventVisibility | Visibility level: PRIVATE or PUBLIC |
| `status`      | EventStatus     | Event lifecycle status (see below)  |

### Constraints

* `title`, `date`, `endTime` required.
* `date < endTime` enforced at validation layer.
* `creatorId` must reference a valid `User.id`.
* `status` must be one of: `DRAFT`, `PUBLISHED`, `CANCELLED`.
* `visibility` must be one of: `PRIVATE`, `PUBLIC`.

### Indexes

* `id` (PK)
* `creatorId` (FK)
* `date`, `endTime` (composite for range queries)

---

## EventStatus

Represents the lifecycle state of an event:

| Value       | Description                                                                |
|-------------|----------------------------------------------------------------------------|
| `DRAFT`     | Event is being created and is not yet visible to others. Not finalized.    |
| `PUBLISHED` | Event is finalized and visible to others based on its visibility setting.  |
| `CANCELLED` | Event has been cancelled. May still be shown for historical/audit reasons. |

### Use cases:

* Prevent showing DRAFT events in general listings.

* Block editing of CANCELLED events except by creator/admin.

* Filter upcoming events by status = PUBLISHED.

## EventVisibility

Represents the lifecycle state of an event:

| Value     | Description                                                                 |
|-----------|-----------------------------------------------------------------------------|
| `PRIVATE` | Visible only to the event creator and explicitly invited attendees.         |
| `PUBLIC`  | Discoverable and viewable by all users (e.g., for public listings/explore). |

### Use cases:

* Determine visibility of event in search results or calendars.

* Enforce permission checks before accessing event details.

## Attendee

Represents a person attending an event (not a registered user).

| Attribute    | Type       | Description                   |
|--------------|------------|-------------------------------|
| `id`         | ID         | Unique identifier             |
| `personId`   | ID         | Reference to `Person.id`      |
| `rsvpStatus` | RSVPStatus | One of GOING, MAYBE, DECLINED |
| `eventId`    | ID         | Reference to `Event.id`       |

### Constraints

* No duplicate `email` for same `eventId`.

### Indexes

* `id` (PK)
* `eventId` (FK)
* `email` (optional index for lookup)

---

## RSVPStatus (Enum) Table

Describes an attendee's response:

* `GOING`
* `MAYBE`
* `DECLINED`

---

## Tag

Represents a label that categorizes events.

| Attribute    | Type   | Description                 |
|--------------|--------|-----------------------------|
| `id`         | ID     | Unique identifier           |
| `label`      | String | E.g., "Public", "Team"      |
| `categoryId` | String | Reference to TagCategory.id |

### Constraints

* `label` must be unique.
* `categoryId` is optional, but if present must reference a valid TagCategory.

### Indexes

* `id` (PK)
* `label` (UNIQUE)
* `categoryId` (FK)

---

## TagCategory

Represents a label that categorizes events.

| Attribute     | Type   | Description                                                            |
|---------------|--------|------------------------------------------------------------------------|
| `id`          | ID     | Unique identifier                                                      |
| `name`        | String | category name (e.g., "general, birthday, Team, Family, movie-trailer") |
| `description` | String | Description about the category                                         |

### Constraints

* `id` is primary key.
* `name` must be unique.

### Indexes

* `id` (PK)
* `name` (UNIQUE)

---

## Relationships

| Relationship           | Type         | Description                                                |
|------------------------|--------------|------------------------------------------------------------|
| User -> Person         | One-to-one   | A user maps to a person identity profile (via personId)    |
| User -> Events         | One-to-Many  | 	A user can create many events                             |
| Event -> Tags          | Many-to-Many | Events can be tagged with multiple tags                    |
| Event -> User          | Many-to-One  | Event creator id/reference                                 |
| Event -> Attendees     | One-to-Many  | more than one attendee can can attend event                |
| Attendee -> Events     | Many-to-One  | Each attendee belongs to one event                         |
| Attendee -> RSVPStatus | Enum-based   | Each attendee has a RSVP status: GOING, MAYBE, or DECLINED |
| Tag -> TagCategory     | Many-to-One  | A tag may belong to a category                             |
| TagCategory -> Tags    | One-to-Many  | A category can group multiple tags                         |

**Join Tables:**

* `EventTag (eventId, tagId)` for many-to-many between events and tags.

    * Composite PK: (`eventId`, `tagId`)
    * Indexes: `eventId`, `tagId`

---

## Performance & Indexing Notes

* Composite indexes for `Event.date + creatorId` useful for dashboard queries.
* Full-text search or `LIKE` index on `Tag.label` for tag autocomplete.
* Consider pagination and cursor-based queries for `events` and `attendees` lists.

---

## Assumptions

* User email is handled internally but not exposed as a public field.
* Dates are stored and validated in ISO 8601 format (UTC recommended).
* Only authenticated users (via token) can create/update/delete events and remove attendees.

---
