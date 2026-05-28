import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

// import routes
import githubRoutes from "./routes/githubRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import questRoutes from "./routes/questRoutes.js";
import partyRoutes from "./routes/partyRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(bodyParser.json());

// connect MongoDB
connectDB();

// routes
app.get('/api/test-health', (req, res) => {
    res.json({ message: 'TeamUP! Backend serverless bridge is running perfectly' });
});

app.use("/api/auth", authRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/quests", questRoutes);
app.use("/api/parties", partyRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/admin", adminRoutes);

// Fallback home route
app.get('/', (req, res) => {
    res.send('TeamUP! Backend is running');
});

// CRUCIAL: Only fire up app.listen if running locally!
// Netlify manages server execution itself when hosted live.
if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Local server running on port ${PORT}`);
    });
}

// Export the app instance so the serverless handler can run it on Netlify
export default app;