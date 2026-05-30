# DevPulse – Programming Hero Level 02 Batch 07 Module 10 Assignment 02

> Internal Tech Issue & Feature Tracker
>
> _A collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions._

## Live URL

## Features

A user can sign up with proper credentials, may hava either `contributor` or `maintainer` role

**Contributor** - can register and log in, create new issues (bug or feature request), view all issues

**maintainer** - can update any issue field, delete any issue, change issue workflow status independently, alongside all contributor permissions

## Technology Stack

| Technology   | Note                                                                          |
| ------------ | ----------------------------------------------------------------------------- |
| Node.js      | LTS runtime (24.x or higher)                                                  |
| TypeScript   | use latest version, dont use beta version                                     |
| Express.js   | Modular router architecture                                                   |
| PostgreSQL   | Relational database, native `pg` driver only                                  |
| Raw SQL      | Direct `pool.query()` calls, absolutely no query builders, ORMs, or SQL JOINs |
| bcrypt       | Password hashing, salt rounds between 8 and 12                                |
| jsonwebtoken | JWT generation & verification (standard tokens)                               |

---

## 🗺️ API Endpoint List

The backend exposes the following RESTful endpoints. All request and response bodies are in JSON format.

### Authentication Endpoints

| Method | Endpoint           | Description                                | Auth Required |
| :----- | :----------------- | :----------------------------------------- | :------------ |
| `POST` | `/api/auth/signup` | Registers a new user                       | No            |
| `POST` | `/api/auth/login`  | Authenticates a user & returns a JWT token | No            |

### Tasks Endpoints

| Method   | Endpoint          | Description                                | Auth Required          |
| :------- | :---------------- | :----------------------------------------- | :--------------------- |
| `GET`    | `/api/issues`     | Retrieves all issue for the logged-in user | **Yes** (Bearer Token) |
| `POST`   | `/api/issues`     | Creates a new issue                        | **Yes** (Bearer Token) |
| `GET`    | `/api/issues/:id` | get full details of an existing task by ID | **Yes** (Bearer Token) |
| `PATCH`  | `/api/issues/:id` | Updates an existing issue by ID            | **Yes** (Bearer Token) |
| `DELETE` | `/api/issues/:id` | Deletes an issue by ID                     | **Yes** (Bearer Token) |

---

## Database Schema Design

### Table 1: `users`

| Field        | Requirement (Plain Text)                                                                            |
| ------------ | --------------------------------------------------------------------------------------------------- |
| `id`         | Auto-incrementing unique identifier for each account                                                |
| `name`       | Full display name of the team member, must be provided                                              |
| `email`      | Valid login address, must be unique across all accounts, must be provided                           |
| `password`   | Encrypted string stored securely, must be provided during registration, never returned in responses |
| `role`       | Determines system access level, defaults to `contributor`, must be `contributor` or `maintainer`    |
| `created_at` | Timestamp marking when the account was created, automatically generated on insert                   |
| `updated_at` | Timestamp marking when the account was last updated, automatically refreshed on update              |

### Table 2: `issues`

| Field         | Requirement (Plain Text)                                                                                        |
| ------------- | --------------------------------------------------------------------------------------------------------------- |
| `id`          | Auto-incrementing unique identifier for each reported item                                                      |
| `title`       | Short descriptive headline, must be provided, maximum 150 characters                                            |
| `description` | Detailed explanation of the problem or suggestion, must be provided, minimum 20 characters                      |
| `type`        | Categorizes the entry, must be either `bug` or `feature_request`                                                |
| `status`      | Current workflow state, defaults to `open`. Status must be one of: `open`, `in_progress`, `resolved`            |
| `reporter_id` | References the user who submitted the issue (no foreign key constraint required; validate in application logic) |
| `created_at`  | Timestamp marking when the issue was created, automatically generated on insert                                 |
| `updated_at`  | Timestamp marking when the issue was last updated, automatically refreshed on update                            |

---
