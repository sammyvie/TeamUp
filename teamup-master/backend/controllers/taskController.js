import Task from "../models/Task.js";
import Quest from "../models/Quest.js";
import Party from "../models/Party.js";

// create task (POST)
export const createTask = async (req, res) => {
    try {
        const { name, description } = req.body;
        const { questId } = req.params;

        const lastTask = await Task.findOne({ quest: questId })
            .sort({ taskNum: -1 });

        const nextTaskNum = lastTask ? lastTask.taskNum + 1 : 1;

        // max tax
        const taskCount = await Task.countDocuments({ quest: questId });

        if (taskCount >= 10) {
            return res.status(400).json({
                message: "Maximum of 10 tasks allowed per quest"
            });
        }

        // check if quest exists
        const quest = await Quest.findById(questId);

        if (!quest || quest.status !== "in_progress") {
            return res.status(400).json({
                message: "Tasks can only be created for active quests"
            });
        }

        // only assigned partyMaster can create task for a quest 
        const party = await Party.findOne({ activeQuest: questId });

        if (!party || party.partyMaster.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You are not assigned to this quest"
            });
        }

        // auto increment taskNum
        const task = await Task.create({
            name,
            description,
            partyMaster: req.user._id,
            quest: questId,
            taskNum: nextTaskNum
        });

        res.status(201).json(task);

    } catch (error) {
        res.status(500).json({
            message: "Failed to create task",
            error: error.message
        });
    }
};

// list all tasks (GET)
export const getTasksByQuest = async (req, res) => {
    try {
        const { questId } = req.params;

        const tasks = await Task.find({ quest: questId })
            .populate("partyMaster", "fullName")
            .populate({
                path: "quest",
                populate: {
                    path: "party",
                    select: "name status"
                }
            })
            .sort({ createdAt: -1 });

        res.json(tasks);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch tasks",
            error: error.message
        });
    }
};


// update task (PUT)
export const updateTask= async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // check if user is partyMaster
        if (task.partyMaster.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this task" });
        }

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedTask);

    } catch (error) {
        res.status(500).json({
            message: "Failed to update task",
            error: error.message
        });
    }
};


// delete task (DELETE)
export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // check if user is partyMaster
        if (task.partyMaster.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this task" });
        }

        let deletedTask = await Task.findByIdAndDelete(req.params.id);

        res.json(deletedTask);

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete task",
            error: error.message
        })
    }
}
