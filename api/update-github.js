const fetch = require('node-fetch');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { filePath, dataToSave, currentSha, commitMessage, repoOwner, repoName } = JSON.parse(event.body);
    const GITHUB_TOKEN = process.env.GITHUB_API_TOKEN;
    if (!GITHUB_TOKEN) { return { statusCode: 500, body: 'Kesalahan server: GITHUB_API_TOKEN tidak ditemukan.' }; }
    const API_URL = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
    const content = (typeof dataToSave === 'string') ? dataToSave : JSON.stringify(dataToSave, null, 2);
    const encodedContent = Buffer.from(content).toString('base64');
    const body = { message: commitMessage, content: encodedContent, sha: currentSha };
    const response = await fetch(API_URL, { method: 'PUT', headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!response.ok) { throw new Error(`GitHub API Error: ${response.statusText}`); }
    const result = await response.json();
    return { statusCode: 200, body: JSON.stringify({ newSha: result.content.sha }) };
  } catch (error) { return { statusCode: 500, body: JSON.stringify({ error: error.message }) }; }
};