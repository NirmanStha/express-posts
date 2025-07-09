import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Social Media API",
      version: "1.0.0",
      description:
        "A comprehensive social media API with user authentication, posts, and comments",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5000/api",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "User ID",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
            },
            username: {
              type: "string",
              description: "Username",
            },
            profilePicture: {
              type: "string",
              description: "Profile picture filename",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Post: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Post ID",
            },
            content: {
              type: "string",
              description: "Post content",
            },
            images: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Array of image filenames",
            },
            userId: {
              type: "string",
              description: "ID of the user who created the post",
            },
            user: {
              $ref: "#/components/schemas/User",
            },
            comments: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Comment",
              },
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Comment: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Comment ID",
            },
            content: {
              type: "string",
              description: "Comment content",
            },
            userId: {
              type: "string",
              description: "ID of the user who created the comment",
            },
            postId: {
              type: "string",
              description: "ID of the post this comment belongs to",
            },
            user: {
              $ref: "#/components/schemas/User",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "error",
            },
            message: {
              type: "string",
              description: "Error message",
            },
            errors: {
              type: "array",
              items: {
                type: "object",
              },
              description: "Detailed validation errors",
            },
          },
        },
        Success: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "success",
            },
            message: {
              type: "string",
              description: "Success message",
            },
            data: {
              type: "object",
              description: "Response data",
            },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "success",
            },
            message: {
              type: "string",
              example: "Login successful",
            },
            accessToken: {
              type: "string",
              description: "JWT access token",
            },
            refreshToken: {
              type: "string",
              description: "JWT refresh token",
            },
            user: {
              $ref: "#/components/schemas/User",
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controller/**/*.ts"], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
