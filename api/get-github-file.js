const fetch = require('node-fetch');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { filePath, repoOwner, repoName } = JSON.parse(event.body);
    const GITHUB_TOKEN = process.env.GITHUB_API_TOKEN;
    if (!GITHUB_TOKEN) { return { statusCode: 500, body: 'Kesalahan server: GITHUB_API_TOKEN tidak ditemukan.' }; }
    const API_URL = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}?t=${new Date().getTime()}`;
    const response = await fetch(API_URL, { headers: { 'Authorization': `token ${GITHUB_TOKEN}` } });
    if (!response.ok) {
        if (response.status === 404) { return { statusCode: 200, body: JSON.stringify({ data: null, sha: null }) }; }
        throw new Error(`GitHub API Error: ${response.statusText}`);
    }
    const file = await response.json();
    const content = Buffer.from(file.content, 'base64').toString('utf-8');
    const data = filePath.endsWith('.json') ? JSON.parse(content) : content;
    return { statusCode: 200, body: JSON.stringify({ data, sha: file.sha }) };
  } catch (error) { return { statusCode: 500, body: JSON.stringify({ error: error.message }) }; }
};