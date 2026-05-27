import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import { hashPassword } from "./utils/hashPassword.js";

dotenv.config();

const seedAdmin = async () => {
    try {
        // Connect to your cloud database using your .env URI
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB Atlas...");

        // Check if admin already exists
        const adminExists = await User.findOne({ email: "admin@teamup.com" });
        if (adminExists) {
            console.log("Admin account already exists! Deleting old record to reset...");
            await User.deleteOne({ email: "admin@teamup.com" });
        }

        // Hash the admin password perfectly using your project utility
        const hashedPassword = await hashPassword("teamup-admin1234");

        // Create the admin user directly
        await User.create({
            fullName: "System Admin",
            email: "admin@teamup.com",
            password: hashedPassword,
            role: "admin", // Bypasses frontend role checks completely
            githubUsername: "admin-dev",
            phoneNum: "0000000000",
            location: "PH",
            level: 99,
            exp: 9999
        });

        console.log("🚀 Admin account created successfully with encrypted password!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedAdmin();