import { Router } from "express";
import upload from "../middlewares/upload";
import { AuthController } from "../controller/auth/auth.controller";
const router = Router();

router
  .route("/register")
  .post(upload.single("profilepic"), AuthController.register);
router.route("/login").post(AuthController.login);

export default router;
