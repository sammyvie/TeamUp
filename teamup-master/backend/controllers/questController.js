import mongoose from "mongoose";

import Quest from "../models/Quest.js";
import Party from "../models/Party.js";
import { getRepoCommits } from "../services/githubService.js";

// create quest (POST)
export const createQuest = async (req, res) => {
    try {
        const {  
            title,
            description,
            techStack,
            deadline,
            githubRepoOwner,
            githubRepoName
        } = req.body;

        const quest = await Quest.create({
            title,
            description,
            techStack,
            deadline,
            githubRepo: {
                owner: githubRepoOwner,
                name: githubRepoName
            },
            commissioner: req.user._id
        });

        // if required fields missing
        if (!title || !githubRepoOwner || !githubRepoName) {
            return res.status(400).json({
                message: "Missing required fields"
            });
        }


        res.status(201).json(quest);

    } catch (error) {
        res.status(500).json({
            message: "Failed to create quest",
            error: error.message
        });
    }
};

// list all quests (GET)
export const listQuests = async (req, res) => {
    try {
        const quests = await Quest.find().populate("commissioner", "fullName email").sort({ createdAt: -1 });

        res.json(quests);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch quests",
            error: error.message
        });
    }
};

// list all quest of party (GET)
export const listQuestsByParty = async (req, res) => {
    try {
        const partyId = req.params.id;

        // if not valid id
        if (!mongoose.Types.ObjectId.isValid(partyId)) {
            return res.status(400).json({ message: "Invalid party ID" });
        }

        const quests = await Quest.find({ party: partyId })
            .populate("commissioner", "fullName email")
            .sort({ createdAt: -1 });

        res.json(quests);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch quests",
            error: error.message
        });
    }
}

// get quest details by id (GET)
export const getQuestById = async (req, res) => {
    try {
        const quest = await Quest.findById(req.params.id).populate("commissioner", "fullName email");

        if (!quest) {
            return res.status(404).json({ message: "Quest not found" });
        }

        res.json(quest);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch quest",
            error: error.message
        });
    }   
};

// update quest (PUT)
export const updateQuest = async (req, res) => {
    try {
        const quest = await Quest.findById(req.params.id);

        if (!quest) {
            return res.status(404).json({ message: "Quest not found" });
        }

        // check if user is the commissioner
        if (quest.commissioner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this quest" });
        }

        const updatedQuest = await Quest.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        

        res.json(updatedQuest);


    } catch (error) {
        res.status(500).json({
            message: "Failed to update quest",
            error: error.message
        });
    }
};

// complete quest
export const completeQuest = async (req, res) => {
    try {
        const quest = await Quest.findById(req.params.id);

        if (!quest) {
            return res.status(404).json({ message: "Quest not found" });
        }

        // only commissioner can complete
        if (quest.commissioner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Not authorized to complete the quest"
            });
        }

        // must be in progress
        if (quest.status !== "in_progress") {
            return res.status(400).json({
                message: "Only in-progress quests can be completed"
            });
        }

        // find party doing this quest
        const party = await Party.findOne({ activeQuest: quest._id })
            .populate("partyMaster")
            .populate("apprentices");

        if (!party) {
            return res.status(404).json({
                message: "No party assigned to this quest"
            });
        }

        // get commits for each member
        const members = [party.partyMaster, ...party.apprentices];

        let totalExp = 0;

        

        for (const member of members) {
            if (!member.githubUsername) continue;

            const commits = await getRepoCommits(
                quest.githubRepo.owner,
                quest.githubRepo.name,
                member.githubUsername
            );

            const exp = commits * 100;

            // helper function
            const getExpCap = (level) => {
                if (level <= 5) return 4000;
                if (level <= 10) return 10000;
                return 25000;
            };

            member.exp += exp;

            // allow multiple level-ups
            let cap = getExpCap(member.level);

            while (member.exp >= cap) {
                member.exp -= cap;
                member.level += 1;
                cap = getExpCap(member.level);
            }

            await member.save();

            totalExp += exp;
        }

        // update quest + party
        quest.status = "completed";
        await quest.save();

        party.status = "ready_for_quest";
        party.activeQuest = null;
        await party.save();

        res.json({
            message: "Quest completed successfully",
            totalExpDistributed: totalExp,
            quest,
            party
        });

    } catch (error) {
        console.error("Complete Quest Error:"),
        res.status(500).json({
            message: "Failed to complete quest",
            error: error.message
        });
    }
};
