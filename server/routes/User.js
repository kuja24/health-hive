import express from "express";
import {
  SignIn,
  SignUp,
  createNewWorkout,
  getDashboard,
  filterWorkoutByDate,
} from "../controllers/User.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/signup", SignUp);
router.post("/signin", SignIn);

router.get("/workout", verifyToken, filterWorkoutByDate);
router.get("/dashboard", verifyToken, getDashboard);
router.post("/workout", verifyToken, createNewWorkout);

export default router;
