import { Router } from "express";
import { authUser } from "../middlewares/authenticate";
import { CommentController } from "../controller/comments/comment.controller";

const router = Router();

router.route("/").post(authUser, CommentController.create);
router.route("/:id").patch(authUser, CommentController.update);
router.route("/:id").delete(authUser, CommentController.delete);
router.route("/:id").get(authUser, CommentController.show);
export default router;
