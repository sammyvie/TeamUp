import User from "../models/User.js";
import { hashPassword, comparePassword } from "../utils/hashPassword.js";
import { generateToken } from "../utils/generateToken.js";
import { getUserTotalCommits } from "../services/githubService.js";

// register new user (POST)
export const register = async (req, res) => {
    try {
        const { fullName, email, password, role, githubUsername, phoneNum, location, professionalInfo } = req.body;
        
        // 1. Validate mandatory fields
        if (!fullName || !email || !password) {
            return res.status(400).json({
                message: "Please provide required fields"
            });
        }

        // 2. Check if user already exists
        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // 3. Normalize roles based on your registration screens
        let assignedRole = role ? role.toLowerCase() : "apprentice";
        if (assignedRole === "freelancer") {
            assignedRole = "apprentice";
        }

        // Validate final role structure
        if (!["apprentice", "commissioner", "admin"].includes(assignedRole)) {
            return res.status(400).json({ message: "Invalid role assignment" });
        }

        // 4. Encrypt password safely
        const hashedPassword = await hashPassword(password);

        // 5. Create user profile in database
        const user = await User.create({
            fullName,
            email,
            password: hashedPassword,
            role: assignedRole,
            githubUsername: githubUsername || "", 
            phoneNum: phoneNum || "",
            location: location || "",
            professionalInfo: {
                primarySkills: professionalInfo?.primarySkills || [],
                techStack: professionalInfo?.techStack || []
            }
        });

        // Strip password from registration response object for security
        const savedUser = user.toObject();
        delete savedUser.password;

        // ✨ FIXED: Send back the user details AND the token so they stay logged in immediately!
        res.status(201).json({ 
            user: {
                _id: savedUser._id,
                fullName: savedUser.fullName,
                email: savedUser.email,
                role: savedUser.role,
                githubUsername: savedUser.githubUsername,
                level: savedUser.level,
                exp: savedUser.exp,
            },
            token: generateToken(savedUser._id)
        });

    } catch (error) {
        console.error("REGISTRATION FAILURE:", error);
        res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
};

// login existing user (POST)
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select("+password");

        // 1. Authenticate credentials cleanly
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // 2. Freelancer Automation: Role promotion check based on commit milestones
        if (user.role === "apprentice" && user.githubUsername && user.githubUsername.trim() !== "") {
            try {
                const commits = await getUserTotalCommits(user.githubUsername);

                // Promotes freelancer to Party Master if they cross the 3,000 threshold
                if (commits >= 3000 && user.role !== "partyMaster") {
                    user.role = "partyMaster";
                    await user.save();
                    console.log(`Freelancer ${user.email} promoted to Party Master!`);
                }
            } catch (githubErr) {
                console.error("GitHub sync skipped during login:", githubErr.message);
            }
        }

        // 3. Generate secure session payload
        res.json({
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                githubUsername: user.githubUsername,
                level: user.level,
                exp: user.exp,
            },
            token: generateToken(user._id)
        });

    } catch (error) {
        console.error("SYSTEM LOGIN CRASH REASON:", error);
        res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
};

// user profile (GET)
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select("-password")
            .populate({
                path: "currentParty",
                populate: [
                    { path: "partyMaster", select: "fullName email" },
                    { path: "apprentices", select: "fullName email" },
                    { path: "activeQuest", select: "title status" }
                ]
            });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch profile",
            error: error.message
        });
    }
};