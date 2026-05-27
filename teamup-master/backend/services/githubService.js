import axios from "axios";

// get num of commits on specific repo
export const getRepoCommits = async (owner, repo, username) => {
    const githubAPI = axios.create({
        baseURL: "https://api.github.com",
        headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            Accept: "application/vnd.github+json"
        }
    });

    try {
        const response = await githubAPI.get(`/repos/${owner}/${repo}/commits`, {
            params: { author: username, per_page: 100 }
        });

        return response.data.length;

    } catch (error) {
        console.error("GitHub Service Error:", error.response?.data);
        throw error;
    }
};

// get total num of commits across all repos
export const getUserTotalCommits = async (username) => {
    try {
        const response = await axios.get(
            `https://api.github.com/search/commits`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                    Accept: "application/vnd.github.cloak-preview"
                },
                params: {
                    // Added 'merge:false' to satisfy GitHub's requirement for a search term keyword
                    q: `author:${username} merge:false`,
                    per_page: 1
                }
            }
        );

        return response.data.total_count || 0;

    } catch (error) {
        console.error("GitHub Contribution Error:", error.response?.data || error.message);
        throw error;
    }
};