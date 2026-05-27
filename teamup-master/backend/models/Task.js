import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxLength: 200
    },
    description: {
        type: String,
        default: '',
        maxLength: 1000
    },
    partyMaster: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quest',
        required: true
    },
    taskNum: {
        type: Number
    },
    status: {
        type: String,
        enum: ["todo", "in_progress", "done"],
        default: "todo"
    }
},
    { timestamps: true }
);

const Task = mongoose.model('Task', taskSchema);
export default Task;
