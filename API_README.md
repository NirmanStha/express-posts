# Social Media API Documentation

A comprehensive RESTful API for a social media platform built with Node.js, Express, TypeScript, and TypeORM.

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MySQL/MariaDB database
- npm or yarn package manager

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd node
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables
   Create a `.env` file in the root directory:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=social_media_db
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
```

4. Start the development server

```bash
npm run dev
```

5. Access the API documentation
   Open your browser and navigate to: `http://localhost:5000/api-docs`

## 📖 API Documentation

The API documentation is available via Swagger UI at `/api-docs` when the server is running.

### Base URL

```
http://localhost:5000/api
```

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 🛠 API Endpoints

### Health

- `GET /health` - Health check endpoint

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `POST /auth/refreshToken` - Refresh access token

### User Management

- `GET /user/me` - Get current user profile
- `GET /user/:id` - Get user by ID
- `PATCH /user/updateUser` - Update user profile

### Posts

- `GET /post/` - Get all posts with pagination, search, and sorting
  - Query parameters:
    - `page` (optional) - Page number (default: 1)
    - `limit` (optional) - Items per page, max 50 (default: 10)
    - `search` (optional) - Search by content, title, or author name
    - `sortBy` (optional) - Field to sort by: `createdAt`, `updatedAt`, `title` (default: `createdAt`)
    - `sortOrder` (optional) - Sort order: `ASC`, `DESC` (default: `DESC`)
- `POST /post/upload` - Create a new post
- `GET /post/:id` - Get a single post
- `PATCH /post/:id` - Update a post

### Comments

#### Nested Routes (under posts)

- `POST /post/:postId/comments` - Create a comment on a post
- `GET /post/:postId/comments/:id` - Get a comment on a post
- `PATCH /post/:postId/comments/:id` - Update a comment on a post
- `DELETE /post/:postId/comments/:id` - Delete a comment on a post

#### Standalone Routes

- `GET /comment/:id` - Get a single comment
- `PATCH /comment/:id` - Update a comment
- `DELETE /comment/:id` - Delete a comment

## 📁 Project Structure

```
src/
├── config/
│   ├── dataSource.ts       # Database configuration
│   ├── repo.ts            # Repository configuration
│   └── swagger.ts         # Swagger configuration
├── controller/
│   ├── auth/              # Authentication controllers
│   ├── comments/          # Comment controllers
│   ├── post/              # Post controllers
│   └── user/              # User controllers
├── entities/              # TypeORM entities
├── helpers/               # Utility functions
├── middlewares/           # Express middlewares
├── routes/                # Route definitions
├── services/              # Business logic
├── uploads/               # File uploads directory
├── validation/            # Input validation schemas
├── api.route.ts          # Main API router
└── index.ts              # Application entry point
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing
- Input validation with Zod
- File upload security
- Error handling middleware

## 📋 Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm run build` - Build the project
- `npm start` - Start production server

## 🔧 Environment Configuration

Required environment variables:

| Variable           | Description        | Example             |
| ------------------ | ------------------ | ------------------- |
| PORT               | Server port        | 5000                |
| DB_HOST            | Database host      | localhost           |
| DB_PORT            | Database port      | 3306                |
| DB_USERNAME        | Database username  | root                |
| DB_PASSWORD        | Database password  | password            |
| DB_DATABASE        | Database name      | social_media_db     |
| JWT_SECRET         | JWT secret key     | your_secret_key     |
| JWT_REFRESH_SECRET | JWT refresh secret | your_refresh_secret |

## 📝 API Response Format

### Success Response

```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": {}
}
```

### Error Response

```json
{
  "status": "error",
  "message": "Error description",
  "errors": []
}
```

## 🧪 Testing

Use the Swagger UI at `/api-docs` to test all endpoints interactively, or use tools like Postman or curl.

### Example API Calls

#### Register a new user

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "username": "testuser"
  }'
```

#### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support, email support@example.com or create an issue in the repository.
