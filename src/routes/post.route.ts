import { Router } from "express";
import upload from "../middlewares/upload";

import { authUser } from "../middlewares/authenticate";
import { PostController } from "../controller/post/post.contoller";
import commentRoute from "./comment.routes";
const router = Router();

/**
 * @swagger
 * /post:
 *   get:
 *     summary: Get all posts with pagination and search
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of posts per page (max 50)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search posts by content, title, or author name
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, title]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Posts retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 17
 *                       title:
 *                         type: string
 *                         example: "My Post Title"
 *                       content:
 *                         type: string
 *                         example: "This is my post content"
 *                       filenames:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["1739441547749-image1.jpg", "1739441547753-image2.jpg"]
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-07-09T07:26:17.471Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-07-09T08:12:34.000Z"
 *                       userId:
 *                         type: integer
 *                         example: 1
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     totalItems:
 *                       type: integer
 *                       example: 42
 *                     itemsPerPage:
 *                       type: integer
 *                       example: 10
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *                     hasPrevPage:
 *                       type: boolean
 *                       example: false
 *                 meta:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-09T08:15:30.123Z"
 *                     version:
 *                       type: string
 *                       example: "1.0"
 *                     filters:
 *                       type: object
 *                       properties:
 *                         search:
 *                           type: string
 *                           nullable: true
 *                           example: "hello world"
 *                         sortBy:
 *                           type: string
 *                           example: "createdAt"
 *                         sortOrder:
 *                           type: string
 *                         sortOrder:
 *                           type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// General routes should come before parameter routes
router.get("/", authUser, PostController.getPosts);

/**
 * @swagger
 * /post/upload:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Post content
 *               title:
 *                 type: string
 *                 description: Post title (optional)
 *               posts:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Post images (optional)
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Post created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 17
 *                     title:
 *                       type: string
 *                       example: "My Post Title"
 *                     content:
 *                       type: string
 *                       example: "This is my post content"
 *                     filenames:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["1739441547749-image1.jpg", "1739441547753-image2.jpg"]
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-09T07:26:17.471Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-09T07:26:17.471Z"
 *                     userId:
 *                       type: integer
 *                       example: 1
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         firstName:
 *                           type: string
 *                           example: "John"
 *                         lastName:
 *                           type: string
 *                           example: "Doe"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router
  .route("/upload")
  .post(authUser, upload.array("posts"), PostController.create);

// Parameter routes
router.use("/:postId/comments", commentRoute);

/**
 * @swagger
 * /post/{id}:
 *   get:
 *     summary: Get a single post by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 17
 *                     title:
 *                       type: string
 *                       example: "My Post Title"
 *                     content:
 *                       type: string
 *                       example: "This is my post content"
 *                     filenames:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["1739441547749-image1.jpg"]
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-09T07:26:17.471Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-09T08:12:34.000Z"
 *                     userId:
 *                       type: integer
 *                       example: 1
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   patch:
 *     summary: Update a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Updated post title
 *               content:
 *                 type: string
 *                 description: Updated post content
 *               posts:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: New post images (optional)
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Post updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 17
 *                     title:
 *                       type: string
 *                       example: "Updated Post Title"
 *                     content:
 *                       type: string
 *                       example: "Updated post content"
 *                     filenames:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["1739441547749-newimage.jpg"]
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-09T07:26:17.471Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-09T08:12:34.000Z"
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Not the owner of the post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", authUser, PostController.getPost);
router
  .route("/:id")
  .patch(authUser, upload.array("posts"), PostController.update);

export default router;
