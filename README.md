# Aloca Backend

Backend API service for Aloca, built with Node.js, Express, and MySQL.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Running the Project with Docker

The easiest way to run the application along with its database is using Docker Compose.

### 1. Start the Application

To start the database and backend services in the background, run the following command in the root directory of the project:

```bash
docker compose up -d
```

*(Note: Older versions of Docker may require `docker-compose up -d` with a hyphen).*

This command will:
1. Pull the MySQL 8.0 image and start the database container (`aloca-db`).
2. Build the Node.js application image based on the `Dockerfile`.
3. Start the backend container (`aloca-backend`).
4. Set up the necessary networks and volumes.

### 2. Verify the Services are Running

Check the status of your containers using:

```bash
docker compose ps
```

You should see two containers running:
- `aloca_mysql_db` (listening on port 3306)
- `aloca_express_backend` (listening on port 3000)

The backend API is now accessible at: **http://localhost:3000**

### 3. Database Management (phpMyAdmin)

A phpMyAdmin instance is included to easily manage your MySQL database via a web interface. 

After running `docker compose up -d`, you can access it at: **http://localhost:8080**

**Login Credentials:**
- **Username:** `root`
- **Password:** `root_password_123`
*(Or use `aloca_user` / `aloca_password_123`)*

### 4. Database Migrations

Currently, migrations are handled via raw SQL files located in the `migrate/` directory.

**Option A: Auto-Initialization**
If you are starting the database container for the *very first time* (i.e., the volume is empty), Docker will automatically execute any `.sql` files found in the `migrate/` directory.

**Option B: Manual Execution (Recommended for existing databases)**
To run a migration file manually into a database that is already running, use the following command in your terminal (adjust the filename as needed):

*Windows (PowerShell):*
```powershell
Get-Content migrate\001_create_users_table.sql | docker exec -i aloca_mysql_db mysql -ualoca_user -paloca_password_123 aloca_management_db
```

*Linux / macOS:*
```bash
docker exec -i aloca_mysql_db mysql -ualoca_user -paloca_password_123 aloca_management_db < migrate/001_create_users_table.sql
```

### 5. Viewing Logs

If you need to troubleshoot or check the application output, you can view the logs:

**To view all logs:**
```bash
docker compose logs -f
```

**To view only backend logs:**
```bash
docker compose logs -f aloca-backend
```

**To view only database logs:**
```bash
docker compose logs -f aloca-db
```
*(Press `Ctrl + C` to exit the log view).*

### 6. Stopping the Application

To stop the containers without removing them:
```bash
docker compose stop
```

To stop and remove the containers, networks, and volumes (this will **DELETE** your local database data):
```bash
docker compose down -v
```
*(Omit the `-v` flag if you want to preserve the database data for the next time you start it).*

## Environment Variables
The application uses the following default environment variables in the `docker-compose.yml`:
- `PORT`: 3000
- `NODE_ENV`: development
- Database User: `aloca_user`
- Database Password: `aloca_password_123`
- Database Name: `aloca_management_db`
