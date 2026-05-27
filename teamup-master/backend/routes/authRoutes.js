import express from "express";
import { register, login, getProfile } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js"

const router = express.Router();

// auth routes
router.post("/register", register);
router.post("/login", login);

// logged-in user
router.get("/profile", protect, getProfile);

export default router;
