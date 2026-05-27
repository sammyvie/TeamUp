import mongoose from 'mongoose';

const PartySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxLength: 80
    },
    description: {
        type: String,
        default: '',
        maxLength: 500
    },
    partyMaster: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    apprentices: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        } 
    ],
    activeQuest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quest',
        default: null,
    },
    status: {
        type: String,
        enum: ['forming', 'on_quest', 'ready_for_quest', 'disbanded'],
        default: 'forming',
    },
    techStack: {
        type: [String],
        default: []
    }
},
    { timestamps: true }
);

const Party = mongoose.model('Party', PartySchema);

export default Party;