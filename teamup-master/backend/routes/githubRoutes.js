import express from "express";
import { getQuestCommits, getUserContributions } from "../controllers/githubController.js";

const router = express.Router();

// github routes
router.get("/commits/:owner/:repo/:username", getQuestCommits);
router.get("/contributions/:username", getUserContributions)

export default router;
