import express from "express";
import {
    createQuest,
    listQuests,
    listQuestsByParty,
    getQuestById,
    updateQuest,
    completeQuest
} from "../controllers/questController.js";

import { protect } from "../middleware/authMiddleware.js";
import { restrictTo } from "../middleware/roleMiddleware.js";

const router = express.Router();

// commissioner restricted route
router.post("/", protect, restrictTo("commissioner"), createQuest);
router.put("/:id", protect, restrictTo("commissioner"),  updateQuest);
router.post("/:id/complete", protect, restrictTo("commissioner"), completeQuest);

// public
router.get("/", listQuests);
router.get("/party/:id", listQuestsByParty);
router.get("/:id", getQuestById);


export default router;
