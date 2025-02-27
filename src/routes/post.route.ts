import { Router } from "express";
import upload from "../middlewares/upload";

import { authUser } from "../middlewares/authenticate";
import { PostController } from "../controller/post/post.contoller";
import commentRoute from "./comment.routes";
const router = Router();
router.use("/:postId/comments", commentRoute);
router.get("/:id", authUser, PostController.getPost);
router
  .route("/:id")
  .patch(authUser, upload.array("posts"), PostController.update);
router
  .route("/upload")
  .post(authUser, upload.array("posts"), PostController.create);
router.get("/", authUser, PostController.getPosts);
export default router;
