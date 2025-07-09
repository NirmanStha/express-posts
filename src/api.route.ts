import { Router } from "express";
import authRoute from "./routes/auth.router";
import userRoute from "./routes/user.route";
import postRoute from "./routes/post.route";
import commentRoute from "./routes/comment.standalone.routes";
const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication endpoints
 *   - name: User
 *     description: User profile management
 *   - name: Posts
 *     description: Post management endpoints
 *   - name: Comments
 *     description: Comment management endpoints
 */

router.use("/auth", authRoute);
router.use("/user", userRoute);
router.use("/post", postRoute);
router.use("/comment", commentRoute);
export default router;
