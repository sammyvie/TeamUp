import { getRepoCommits, getUserTotalCommits } from "../services/githubService.js";

// get commits for a specific quest (GET)
export const getQuestCommits = async (req, res) => {
    try {
        const { owner, repo, username } = req.params;
        const commits = await getRepoCommits(owner, repo, username);

        res.json({
            repo: `${owner}/${repo}`,
            user: username,
            commits
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch GitHub commits",
            error: error.message
        });
    }
};

// get user contributions (GET)
export const getUserContributions = async (req, res) => {
    try {
        const { username } = req.params;

        const totalCommits = await getUserTotalCommits(username);

        res.json({
            user: username,
            totalCommits
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch GitHub user contributions",
            error: error.message
        });
    }
}