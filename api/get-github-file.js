import fetch from 'node-fetch';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).send('Method Not Allowed');
  }
  try {
    const { filePath, repoOwner, repoName } = request.body;
    const GITHUB_TOKEN = process.env.GITHUB_API_TOKEN;

    if (!GITHUB_TOKEN) {
      return response.status(500).json({ error: 'Kesalahan server: GITHUB_API_TOKEN tidak ditemukan.' });
    }

    const API_URL = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}?t=${new Date().getTime()}`;
    const githubResponse = await fetch(API_URL, {
      headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
    });

    if (!githubResponse.ok) {
      if (githubResponse.status === 404) {
        return response.status(200).json({ data: null, sha: null });
      }
      throw new Error(`GitHub API Error: ${githubResponse.statusText}`);
    }

    const file = await githubResponse.json();
    const content = Buffer.from(file.content, 'base64').toString('utf-8');
    const data = filePath.endsWith('.json') ? JSON.parse(content) : content;

    return response.status(200).json({ data, sha: file.sha });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
