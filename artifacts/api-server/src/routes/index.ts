import { Router, type IRouter } from "express";
import healthRouter from "./health";
import interviewRouter from "./interviews";

const router: IRouter = Router();

router.use(healthRouter);
router.use(interviewRouter);

export default router;
