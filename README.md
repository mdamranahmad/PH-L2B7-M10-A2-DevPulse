# DevPulse – Programming Hero Level 02 Batch 07 Module 10 Assignment 02

> **Internal Tech Issue & Feature Tracker**
>
> A collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions.

---

## 🔗 Links

- **Live Deployment:** [https://b7a2-devpulse.vercel.app/](https://b7a2-devpulse.vercel.app/)

---

## ✨ Features

DevPulse implements a Role-Based Access Control (RBAC) system with two primary roles:

- **Contributor** \* Register accounts and securely log in.
  - Create new issues (categorized as either `bug` or `feature_request`).
  - View all submitted issues.
  - Update fields of an existing issue if user is the owner.
- **Maintainer**
  - Inherits all permissions from the **Contributor** role.
  - Update any fields of an existing issue.
  - Change issue workflow statuses independently.
  - Delete any issue from the system.

---

## 🛠️ Technology Stack

| Technology       | Version / Specification | Note                                                 |
| :--------------- | :---------------------- | :--------------------------------------------------- |
| **Node.js**      | LTS (v24.x or higher)   | Server-side runtime environment                      |
| **TypeScript**   | v6.0.3                  | Strict type-safe programming language                |
| **Express.js**   | Latest                  | Minimalist, modular router architecture              |
| **PostgreSQL**   | Relational Database     | Data storage using the native `pg` driver only       |
| **Raw SQL**      | Direct Queries          | No ORM used; interaction via explicit `pool.query()` |
| **bcrypt**       | 10 Salt Rounds          | Secure password hashing                              |
| **jsonwebtoken** | Standard JWT            | Token-based stateless user authentication            |

---

## 🗺️ API Endpoints

All request body payloads and server responses are formatted strictly in JSON.

### Authentication Endpoints

| Method | Endpoint           | Description                                | Auth Required |
| :----- | :----------------- | :----------------------------------------- | :------------ |
| `POST` | `/api/auth/signup` | Registers a new user                       | No            |
| `POST` | `/api/auth/login`  | Authenticates a user & returns a JWT token | No            |

### Issues/Tasks Endpoints

| Method   | Endpoint          | Description                                      | Auth Required                  |
| :------- | :---------------- | :----------------------------------------------- | :----------------------------- |
| `GET`    | `/api/issues`     | Retrieves all issues for the logged-in user      | **Yes** (JWT (JSON Web Token)) |
| `POST`   | `/api/issues`     | Creates a new issue entry                        | **Yes** (JWT (JSON Web Token)) |
| `GET`    | `/api/issues/:id` | Retrieves full details of a specific issue by ID | **Yes** (JWT (JSON Web Token)) |
| `PATCH`  | `/api/issues/:id` | Updates an existing issue's fields or status     | **Yes** (JWT (JSON Web Token)) |
| `DELETE` | `/api/issues/:id` | Deletes a specific issue from the database       | **Yes** (JWT (JSON Web Token)) |

---

## 🗄️ Database Schema Design

### 1. `users` Table

| Field        | Type / Constraints                 | Requirement Description                                            |
| :----------- | :--------------------------------- | :----------------------------------------------------------------- |
| `id`         | `SERIAL PRIMARY KEY`               | Auto-incrementing unique identifier for each account.              |
| `name`       | `VARCHAR` (Required)               | Full display name of the team member.                              |
| `email`      | `VARCHAR UNIQUE` (Required)        | Valid login email address; must be unique across all accounts.     |
| `password`   | `VARCHAR` (Required)               | Encrypted string stored securely; never returned in responses.     |
| `role`       | `VARCHAR` (Default: `contributor`) | System access level. Must be either `contributor` or `maintainer`. |
| `created_at` | `TIMESTAMP` (Auto)                 | Automatically generated timestamp upon record insertion.           |
| `updated_at` | `TIMESTAMP` (Auto)                 | Automatically refreshed timestamp whenever the entry updates.      |

### 2. `issues` Table

| Field         | Type / Constraints          | Requirement Description                                           |
| :------------ | :-------------------------- | :---------------------------------------------------------------- |
| `id`          | `SERIAL PRIMARY KEY`        | Auto-incrementing unique identifier for each reported item.       |
| `title`       | `VARCHAR(150)` (Required)   | Short, descriptive headline summarizing the item.                 |
| `description` | `TEXT` (Required)           | Detailed explanation; must be a minimum of 20 characters.         |
| `type`        | `VARCHAR` (Required)        | Categorizes the entry. Must be `bug` or `feature_request`.        |
| `status`      | `VARCHAR` (Default: `open`) | Workflow state. Options: `open`, `in_progress`, or `resolved`.    |
| `reporter_id` | `INTEGER`                   | References the user who submitted the issue (Validated in logic). |
| `created_at`  | `TIMESTAMP` (Auto)          | Automatically generated timestamp upon record insertion.          |
| `updated_at`  | `TIMESTAMP` (Auto)          | Automatically refreshed timestamp whenever the entry updates.     |

---

## 🚀 Getting Started (Local Installation)

Follow these instructions to set up the project locally on your machine.

### Prerequisites

- Node.js installed (v24.x recommended)
- PostgreSQL database up and running

### 1. Clone the Repository

Open your terminal and run the following commands to clone the project and navigate into its root directory:

```bash
git clone https://github.com/mdamranahmad/PH-L2B7-M10-A2-DevPulse.git
cd PH-L2B7-M10-A2-DevPulse
```

### 2. Install Dependencies

Install all the required packages, including TypeScript definitions and development tools:

```bash
npm install
```

### 3. Set Up the PostgreSQL Database/Neon Serverless Database

### 4. Configure Environment Variables

Create a file named `.env` in the root directory of your project. Add your connection credentials and JWT configuration details.

### 5. Running the Application

```bash
npm run dev
```
