# Sustainability API

A Fastify-based API for managing SKU data with PostgreSQL database integration.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database server

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

1. **Install PostgreSQL** if you haven't already:
   - Windows: Download from https://www.postgresql.org/download/windows/
   - macOS: `brew install postgresql`
   - Ubuntu: `sudo apt-get install postgresql postgresql-contrib`

2. **Create a database**:
   ```sql
   CREATE DATABASE sustainability_api;
   ```

3. **Run the database setup script**:
   ```bash
   psql -U your_username -d sustainability_api -f database-setup.sql
   ```

### 3. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# PostgreSQL Database Configuration
PG_HOST=localhost
PG_PORT=5432
PG_USER=your_username
PG_PASSWORD=your_password
PG_DATABASE=sustainability_api
PG_SSL=false

# Server Configuration
PORT=3000
```

**Replace the values with your actual PostgreSQL credentials.**

### 4. Start the Server

```bash
npm start
```

The server will start on port 3000 (or the port specified in your .env file).

## API Endpoints

### Health Check
- `GET /health` - Check if the server is running

### Database Test
- `GET /db-test` - Test the database connection

### SKU Management
- `POST /sku` - Save a new SKU (requires JWT authentication)

### Example SKU POST Request:
```json
{
  "sku": "SKU001",
  "name": "Eco-Friendly Water Bottle",
  "description": "Reusable water bottle made from recycled materials",
  "price": 24.99
}
```

## Database Schema

The application uses a `skus` table with the following structure:

- `id` - Primary key (auto-increment)
- `sku` - Unique SKU identifier
- `name` - Product name
- `description` - Product description
- `price` - Product price
- `created_at` - Timestamp when record was created
- `updated_at` - Timestamp when record was last updated

## Troubleshooting

### Database Connection Issues

1. **Check if PostgreSQL is running**:
   ```bash
   # Windows
   net start postgresql-x64-15
   
   # macOS
   brew services start postgresql
   
   # Ubuntu
   sudo systemctl start postgresql
   ```

2. **Verify your credentials** in the `.env` file

3. **Test the connection** by visiting `http://localhost:3000/db-test`

### Common Issues

- **"password authentication failed"**: Check your PostgreSQL username and password
- **"connection refused"**: Make sure PostgreSQL is running and the port is correct
- **"database does not exist"**: Create the database first using the setup script 