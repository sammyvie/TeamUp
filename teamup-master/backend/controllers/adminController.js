import User from "../models/User.js";
import Quest from "../models/Quest.js";
import Party from "../models/Party.js";

// dashboard page info (GET)
export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalFreelancers = await User.countDocuments({
            role: { $in: ["partyMaster", "apprentice"] }
        });
        const totalClients = await User.countDocuments({ role: "commissioner" });

        const totalQuests = await Quest.countDocuments();

        const activeParties = await Party.countDocuments({ status: "on_quest" });

        const questsInProgress = await Quest.countDocuments({ status: "in_progress" });
        const completedQuests = await Quest.countDocuments({ status: "completed" });

        res.json({
            totalUsers,
            totalFreelancers,
            totalClients,
            totalQuests,
            activeParties,
            questsInProgress,
            completedQuests
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch dashboard stats",
            error: error.message
        });
    }
};

// user growth graph info (GET)
export const getUserGrowth = async (req, res) => {
    try {
        const users = await User.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
        ]);

        res.json(users);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch user growth",
            error: error.message
        });
    }
};

// quest status graph (GET)
export const getQuestStatusStats = async (req, res) => {
    try {
        const stats = await Quest.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json(stats);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch quest stats",
            error: error.message
        });
    }
};

// user page (filter) (GET)
export const getUsers = async (req, res) => {
    try {
        const { role, search } = req.query;

        let query = {};

        if (role && role !== "all") {
            query.role = role;
        }

        if (search) {
            query.fullName = { $regex: search, $options: "i" };
        }

        const users = await User.find(query)
            .populate("currentParty")
            .select("-password")
            .sort({ createdAt: -1 });

        res.json(users);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch users",
            error: error.message
        });
    }
};

// quest page (filter) (GET)
export const getQuests = async (req, res) => {
    try {
        const { status, search } = req.query;

        let query = {};

        if (status && status !== "all") {
            query.status = status;
        }

        if (search) {
            query.title = { $regex: search, $options: "i" };
        }

        const quests = await Quest.find(query)
            .populate("commissioner", "fullName")
            .populate("party")
            .sort({ createdAt: -1 });

        res.json(quests);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch quests",
            error: error.message
        });
    }
};










