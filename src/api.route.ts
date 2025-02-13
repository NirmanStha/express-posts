import { Router } from "express";
import authRoute from "./routes/auth.router";
import userRoute from "./routes/user.route";
import postRoute from "./routes/post.route";
const router = Router();

router.use("/auth", authRoute);
router.use("/user", userRoute);
router.use("/post", postRoute);
export default router;
