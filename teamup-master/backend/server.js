import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

// import routes
import githubRoutes from "./routes/githubRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import questRoutes from "./routes/questRoutes.js";
import partyRoutes from "./routes/partyRoutes.js"
import taskRoutes from "./routes/taskRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"

dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(bodyParser.json());

// connect MongoDB
connectDB();

// route
app.get('/', (req, res) => {
    res.send('TeamUP! Backend is running');
});

app.use("/api/auth", authRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/quests", questRoutes);
app.use("/api/parties", partyRoutes);
app.use("/api/tasks", taskRoutes);

// admin

app.use("/api/admin", adminRoutes);

// start server
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
}); 
