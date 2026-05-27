import mongoose from "mongoose";

const questSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100
    },
    description: {
        type: String,
        default: '',
        maxLength: 1000
    },
    commissioner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    techStack: {
        type: [String],
        default: []
    },
    deadline: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'completed', 'cancelled'],
        default: 'open',
    },
    githubRepo: {
        owner: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        }
    },
    party : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Party',
        default: null
    }
},
    { timestamps: true }

);

const Quest = mongoose.model('Quest', questSchema); 
export default Quest;