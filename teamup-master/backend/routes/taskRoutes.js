import express from "express";
import { 
    createTask,
    getTasksByQuest,
    updateTask,
    deleteTask
} from "../controllers/taskController.js";

import { protect } from "../middleware/authMiddleware.js";
import { restrictTo } from "../middleware/roleMiddleware.js"; 


const router = express.Router();

//partyMaster restricted route
router.post("/:questId", protect, restrictTo("partyMaster"), createTask);
router.put("/:id", protect, restrictTo("partyMaster"), updateTask);
router.delete("/:id", protect, restrictTo("partyMaster"), deleteTask);

// logged-in user
router.get("/:questId", protect, getTasksByQuest);

export default router;