# TeamSync Backend API Engine

Core RESTful API engineering built with NestJS, Prisma ORM, and PostgreSQL. This service powers real-time project management workspaces, automated role-based security access control (RBAC), task prioritization with optimized index lookups, and token-rotation authentication mechanisms.

---

## 🛠️ Architecture & Core Design Decisions

### 1. Database Entity Relationship Diagram (ERD)

Our database maps out five primary relational entities to capture workspace interactions cleanly:

```mermaid
erDiagram
    USER ||--o{ PROJECT : "owns (ProjectOwner)"
    USER ||--o{ PROJECT_MEMBER : "has memberships"
    USER ||--o{ TASK : "assigned to (TaskAssignee)"
    USER ||--o{ COMMENT : "writes"

    PROJECT ||--o{ PROJECT_MEMBER : "contains"
    PROJECT ||--o{ TASK : "comprises"

    TASK ||--o{ COMMENT : "has discussion thread"
```

## Getting Started (Local Setup Lifecycle)

Follow these instructions exactly to pull down, initialize, and run the complete API workspace suite on your local development machine.

### Prerequisites

Make sure you have the following installed locally:

- Node.js (v18 or v20 recommended)

- Docker Desktop / Docker Compose Engine.

### Environmental Variable Configuration

The backend depends on specific credentials to connect to databases and sign secure token payloads. Create a .env file right in the root backend directory:
Open your newly generated .env file and verify it contains the following configurations:

PORT=3000

PostgreSQL Local Infrastructure URLs

DATABASE_URL="postgresql://teamsync_user:teamsync_secure_password@localhost:5432/teamsync_db?schema=public"
SHADOW_DATABASE_URL="postgresql://teamsync_user:teamsync_secure_password@localhost:5432/teamsync_db?schema=shadow"

Cryptographic Token Signatures

JWT_ACCESS_SECRET="teamsync_high_security_access_hash_signature"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_SECRET="teamsync_high_security_refresh_hash_signature"
JWT_REFRESH_EXPIRATION="7d"

### Launch Local Database Infrastructure

Spin up the isolated PostgreSQL database container and pgAdmin visual manager in a detached state using Docker Compose

- docker compose up -d

### Install Dependencies

Restore the backend package libraries and tool definitions

- npm install

### Execute Relational Migrations & DB Seeding

Sync your local database schemas, generate the type-safe Prisma client, and run our automated mock data seeder script

 - npx prisma migrate dev --name init
 - npx prisma db seed

### Launch the Application Engine

Run the development server with hot-reload monitoring enable

 - npm run start:dev

The application successfully initializes and mounts your routes. You will see the confirmation logs printed in your terminal:

 - 🚀 TeamSync backend engine successfully launched on: http://localhost:3000
 - 📄 Dynamic Swagger Open-API interface active at: http://localhost:3000/api/docs
