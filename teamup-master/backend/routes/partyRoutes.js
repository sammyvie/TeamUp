import express from "express";
import {
    createParty,
    joinParty,
    leaveParty,
    listParties,
    getPartyById,
    acceptQuest
} from "../controllers/partyController.js";

import { protect } from "../middleware/authMiddleware.js";
import { restrictTo } from "../middleware/roleMiddleware.js";

const router = express.Router();

// party masters restricted
router.post("/", protect, restrictTo("partyMaster"), createParty);
router.post("/:partyId/accept-quest/:questId", protect, restrictTo("partyMaster"), acceptQuest);

// logged-in user
router.post("/:id/join", protect, joinParty);
router.post("/:id/leave", protect, leaveParty);

// public
router.get("/", listParties);
router.get("/:id", getPartyById);

export default router;
