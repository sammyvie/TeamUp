import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        enum: ['apprentice', 'partyMaster', 'commissioner', 'admin'],
        default: 'apprentice',
    },
    level: {
        type: Number,
        default: 1,
    },
    exp: {
        type: Number,
        default: 0,
    },
    githubUsername: {
        type: String,
    },
    phoneNum: {
        type: String,
    },
    location: {
        type: String,
    },
    professionalInfo: {
        primarySkills: {
            type: [String],
            enum: [
                'Web Development',
                'Mobile Development',
                'UI/UX Design',
                'Backend Development',
                'Frontend Development',
                'Full Stack Development',
                'Game Development',
                'Data Science',
                'Machine Learning',
                'DevOps',
                'Cybersecurity',
                'Cloud Computing',
                'QA / Testing',
                'Technical Writing'
            ],
            default: []
        },
        techStack: {
            type: [String],
            enum: [
                // Frontend
                'HTML',
                'CSS',
                'JavaScript',
                'TypeScript',
                'Angular',
                'React',
                'Vue',
                'Next.js',

                // Backend
                'Node.js',
                'Express.js',
                'Django',
                'Flask',
                'Laravel',

                // Databases
                'MongoDB',
                'MySQL',
                'PostgreSQL',
                'Firebase',

                // DevOps / Tools
                'Docker',
                'Kubernetes',
                'Git',
                'GitHub Actions',

                // Cloud
                'AWS',
                'Azure',
                'Google Cloud',

                // Mobile
                'Flutter',
                'React Native',
                'Swift',
                'Kotlin'
            ],
            default: []
        }
    },
    currentParty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Party',
        default: null,
    }
},
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);


export default User;