import fetch from 'node-fetch';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).send('Method Not Allowed');
  }

  try {
    const { filePath, dataToSave, currentSha, commitMessage, repoOwner, repoName } = request.body;
    const GITHUB_TOKEN = process.env.GITHUB_API_TOKEN;

    if (!GITHUB_TOKEN) {
      return response.status(500).json({ error: 'Kesalahan server: GITHUB_API_TOKEN tidak ditemukan.' });
    }

    const API_URL = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;

    const content = (typeof dataToSave === 'string') ? dataToSave : JSON.stringify(dataToSave, null, 2);
    const encodedContent = Buffer.from(content).toString('base64');
    const body = { message: commitMessage, content: encodedContent, sha: currentSha };

    const githubResponse = await fetch(API_URL, {
      method: 'PUT',
      headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!githubResponse.ok) {
      throw new Error(`GitHub API Error: ${githubResponse.statusText}`);
    }

    const result = await githubResponse.json();

    return response.status(200).json({ newSha: result.content.sha });

  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
                                      }
