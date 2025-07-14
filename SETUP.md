# Mini Event Manager

This document outlines how to set up and run the Mini Event Manager application locally.

---

## Prerequisites

Ensure the following are installed:

- Node.js (>= 18.x)
- npm (>= 9.x) or yarn
- Git

#### For Docker Setup (Optional)
- Docker (>= 20.x)
- Docker Compose (v2)
---

## Clone the Repository

```bash
git clone https://github.com/krishnamurthye/mini-event-manager
cd mini-event-manager
```

## Running in Local
### Install Dependencies

Install server and client dependencies:

#### For the server

```
cd server
npm install
```

#### For the frontend

```
cd ../client
npm install
```

#### Run the Application Locally

In two separate terminals:

1. Start the Backend (GraphQL API)

```
cd server
npm run dev
```

This starts the backend server at http://localhost:4000/graphql.

2. Start the Frontend (Next.js App)

```
cd app
npm run dev
```

This runs the client at http://localhost:3000.

3. To run the unit tests

```
cd app
npm run test
```

## Running in container
### Docker setup

Start All Services
From the root directory:
```
docker-compose up --build

```
Unit tests are executed as part of the Docker build process.


Stop All Services
```
docker-compose down

```
Unit tests are part of the docker build script

### Notes
- .env files are used to configure environment variables in both server/ and app/ folders.

