import express from "express";
import {
    getDashboardStats,
    getUserGrowth,
    getQuestStatusStats,
    getUsers,
    getQuests,
    
} from "../controllers/adminController.js";

import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// admin user only
router.use(protect, isAdmin);

// dashboard
router.get("/dashboard", getDashboardStats);
router.get("/user-growth", getUserGrowth);
router.get("/quest-stats", getQuestStatusStats);

// users
router.get("/users", getUsers);

// quests
router.get("/quests", getQuests);

export default router;
