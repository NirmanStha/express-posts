import { Router } from "express";
import { authUser } from "../middlewares/authenticate";
import { UserController } from "../controller/user/user.contoller";
import upload from "../middlewares/upload";

const router = Router();

router.get("/getUser", authUser, UserController.getUser);
router
  .route("/updateUser")
  .patch(upload.single("profilepic"), authUser, UserController.update);
export default router;
