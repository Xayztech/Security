document.addEventListener('DOMContentLoaded', () => {

    const backgroundVideos = [ 'https://files.catbox.moe/63gj8m.mp4' ];
    const backgroundImages = [ 'https://files.catbox.moe/2c9665.jpg' ];
    const musicSource = 'https://files.catbox.moe/9r2032.mp3';
    const REPO_OWNER = 'Xayztech';
    const REPO_NAME = 'Root-System-Core';
    const USER_FILE_PATH = 'web-users.json';
    const TOKEN_FILE_PATH = 'Ubuntu-sudo-root.json';
    const REMOTE_FILE_PATH = 'idlinux.json';
    const LICENSE_FILE_PATH = 'Ubuntu-License-key.txt';
    const backgroundContainer = document.getElementById('background-container');
    const backsound = document.getElementById('backsound');
    const musicControl = document.getElementById('music-control');
    const loginContainer = document.getElementById('login-container');
    const dashboardContainer = document.getElementById('dashboard-container');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const loadingIndicator = document.getElementById('loading-indicator');
    const logoutButton = document.getElementById('logout-button');
    const userRoleDisplay = document.getElementById('user-role-display');
    const welcomeTextElement = document.getElementById('welcome-text');
    const createUserWidget = document.getElementById('create-user-widget');
    const newUsernameInput = document.getElementById('new-username');
    const newPasswordInput = document.getElementById('new-password');
    const newRoleSelect = document.getElementById('new-role-select');
    const createUserButton = document.getElementById('create-user-button');
    const tokenListDiv = document.getElementById('token-list');
    const tokenInput = document.getElementById('token-input');
    const addTokenBtn = document.getElementById('add-token-btn');
    const delTokenBtn = document.getElementById('del-token-btn');
    const remoteStatusDisplay = document.getElementById('remote-status-display');
    const remoteOnBtn = document.getElementById('remote-on-btn');
    const remoteOffBtn = document.getElementById('remote-off-btn');
    const scriptIdInput = document.getElementById('script-id-input');
    const setScriptIdBtn = document.getElementById('set-script-id-btn');
    const licenseKeyDisplay = document.getElementById('license-key-display');
    const licenseKeyInput = document.getElementById('license-key-input');
    const setLicenseBtn = document.getElementById('set-license-btn');
    
    let currentUser = null;
    let allPanelUsers = [], usersSha;
    let tokenData = { tokens: [] }, tokenSha;
    let remoteData = {}, remoteSha;
    let licenseData = "", licenseSha;

    function setRandomBackground() { const allMedia = [...backgroundVideos, ...backgroundImages]; const randomMedia = allMedia[Math.floor(Math.random() * allMedia.length)]; let element; if (randomMedia.endsWith('.mp4')) { element = document.createElement('video'); element.id = 'background-video'; element.autoplay = true; element.loop = true; element.muted = true; element.playsInline = true; } else { element = document.createElement('img'); element.id = 'background-image'; } element.src = randomMedia; backgroundContainer.appendChild(element); }
    function setupMusic() { backsound.src = musicSource; let isPlaying = false; musicControl.addEventListener('click', () => { if (isPlaying) { backsound.pause(); musicControl.textContent = '🔊 Play Music'; } else { backsound.play().catch(e => console.error("Gagal autoplay:", e)); musicControl.textContent = '⏸️ Pause Music'; } isPlaying = !isPlaying; }); }
    const welcomeMessage = "👋 Hello, Welcome to the Official Bluee Database Security Website || Creator: XΛYZ ƬΣᄃΉ"; let i = 0; function typeWriter() { if (welcomeTextElement && i < welcomeMessage.length) { welcomeTextElement.innerHTML += welcomeMessage.charAt(i++); setTimeout(typeWriter, 100); } }

    // === FUNGSI HELPER ===
    async function getGithubFile(filePath) { try { const response = await fetch('/api/get-github-file', { method: 'POST', body: JSON.stringify({ filePath, repoOwner: REPO_OWNER, repoName: REPO_NAME }) }); if (!response.ok) throw new Error(await response.text()); return await response.json(); } catch (e) { console.error(`Gagal ambil file ${filePath}:`, e); return { data: null, sha: null }; } }
    async function updateGithubFile(filePath, dataToSave, currentSha, commitMessage) { loadingIndicator.style.display = 'block'; try { const response = await fetch('/api/update-github', { method: 'POST', body: JSON.stringify({ filePath, dataToSave, currentSha, commitMessage, repoOwner: REPO_OWNER, repoName: REPO_NAME }) }); if (!response.ok) throw new Error(await response.text()); const result = await response.json(); if (result.error) throw new Error(result.error); return result.newSha; } catch (e) { console.error(`Gagal simpan file ${filePath}:`, e); alert(`Gagal menyimpan: ${e.message}`); return null; } finally { loadingIndicator.style.display = 'none'; } }
    
    async function handleLogin(event) {
        event.preventDefault();

        loadingIndicator.style.display = 'block';
        const userResult = await getGithubFile(USER_FILE_PATH);
        loadingIndicator.style.display = 'none';

        if (!userResult || !userResult.data) {
            alert("KRITIS: Gagal memuat file user dari GitHub. Pastikan Environment Variable di Vercel sudah benar dan di-deploy ulang.");
            return;
        }

        allPanelUsers = userResult.data;
        usersSha = userResult.sha;

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        currentUser = allPanelUsers.find(u => u.username === username && u.password === password);

        if (currentUser) {
            loginContainer.style.display = 'none';
            dashboardContainer.style.display = 'flex';
            await loadInitialDashboardData();
        } else {
            loginError.textContent = "Username atau Password yang Anda masukkan salah.";
        }
                                                                                                                                                                                                                                  }
    async function loadInitialDashboardData() { loadingIndicator.style.display = 'block'; const [tokenResult, remoteResult, licenseResult] = await Promise.all([ getGithubFile(TOKEN_FILE_PATH), getGithubFile(REMOTE_FILE_PATH), getGithubFile(LICENSE_FILE_PATH) ]); loadingIndicator.style.display = 'none'; if (tokenResult.data) { tokenData = tokenResult.data; tokenSha = tokenResult.sha; } if (remoteResult.data) { remoteData = remoteResult.data; remoteSha = remoteResult.sha; } if (licenseResult.data) { licenseData = licenseResult.data; licenseSha = licenseResult.sha; } renderDashboard(); }
    function getManagableRoles(role) { const allRoles = ['developer', 'owner', 'tk', 'pt', 'reseller']; const i = allRoles.indexOf(role); return i === -1 ? [] : allRoles.slice(i); }
    function renderDashboard() { if (!currentUser) return; userRoleDisplay.textContent = currentUser.role.toUpperCase(); tokenListDiv.innerHTML = ''; (tokenData.tokens || []).forEach(token => { const p = document.createElement('p'); p.textContent = `• ${token}`; tokenListDiv.appendChild(p); }); remoteStatusDisplay.textContent = `${remoteData.status.toUpperCase()} | ID: ${remoteData.id_script}`; scriptIdInput.value = remoteData.id_script; if (licenseKeyDisplay) { licenseKeyDisplay.textContent = licenseData; } document.querySelectorAll('.admin-only, .dev-only').forEach(el => el.style.display = 'none'); if (currentUser.role !== 'reseller') { document.querySelector('.admin-only').style.display = 'block'; const manageableRoles = getManagableRoles(currentUser.role); newRoleSelect.innerHTML = ''; if (manageableRoles.length > 0) { manageableRoles.forEach(role => { const option = document.createElement('option'); option.value = role; option.textContent = role.charAt(0).toUpperCase() + role.slice(1); newRoleSelect.appendChild(option); }); createUserButton.disabled = false; } else { const option = document.createElement('option'); option.textContent = 'Tidak ada hak akses'; newRoleSelect.appendChild(option); createUserButton.disabled = true; } } if (currentUser.role === 'developer') { document.querySelectorAll('.dev-only').forEach(el => el.style.display = 'block'); } }
    async function handleCreateUser() { const newUsername = newUsernameInput.value.trim(); const newPassword = newPasswordInput.value.trim(); if (!newUsername || !newPassword) return alert("Input tidak boleh kosong!"); if (allPanelUsers.some(user => user.username === newUsername)) return alert(`Username "${newUsername}" sudah ada.`); const newUser = { id: Date.now(), username: newUsername, password: newPassword, role: newRoleSelect.value }; allPanelUsers.push(newUser); const newSha = await updateGithubFile(USER_FILE_PATH, allPanelUsers, usersSha, `[BOTXAYZ] Create user ${newUsername}`); if (newSha) { usersSha = newSha; alert(`SUKSES! Pengguna "${newUsername}" telah disimpan.`); newUsernameInput.value = ''; newPasswordInput.value = ''; } }
    async function handleAddToken() { const token = tokenInput.value.trim(); if (!token) return alert("Token tidak boleh kosong!"); if (!tokenData.tokens) { tokenData.tokens = []; } if (tokenData.tokens.includes(token)) return alert("Token sudah ada."); tokenData.tokens.push(token); const newSha = await updateGithubFile(TOKEN_FILE_PATH, tokenData, tokenSha, `[BOTXAYZ] Add token`); if (newSha) { tokenSha = newSha; tokenInput.value = ''; renderDashboard(); alert("Token berhasil ditambahkan ke Bluee Database!"); } }
    async function handleDelToken() { const token = tokenInput.value.trim(); if (!token) return alert("Token tidak boleh kosong!"); const index = tokenData.tokens.indexOf(token); if (index === -1) return alert("Token tidak ditemukan."); tokenData.tokens.splice(index, 1); const newSha = await updateGithubFile(TOKEN_FILE_PATH, tokenData, tokenSha, `[BOTXAYZ] Delete token`); if (newSha) { tokenSha = newSha; tokenInput.value = ''; renderDashboard(); alert("Token berhasil dihapus dari Bluee Database!"); } }
    async function handleRemoteToggle(status) { remoteData.status = status; const newSha = await updateGithubFile(REMOTE_FILE_PATH, remoteData, remoteSha, `[XAYZBOT] Remote ${status.toUpperCase()}`); if (newSha) { remoteSha = newSha; renderDashboard(); alert(`Remote status di Bluee Database diubah menjadi ${status.toUpperCase()}!`); } }
    async function handleSetScriptId() { const newId = scriptIdInput.value.trim(); if (!newId) return; remoteData.id_script = newId; const newSha = await updateGithubFile(REMOTE_FILE_PATH, remoteData, remoteSha, `[XAYZBOT] Update script ID`); if (newSha) { remoteSha = newSha; renderDashboard(); alert("ID Script di Bluee Database berhasil diperbarui!"); } }
    async function handleSetLicense() { if (!setLicenseBtn) return; const newLicense = licenseKeyInput.value.trim(); if (!newLicense) return; licenseData = newLicense; const newSha = await updateGithubFile(LICENSE_FILE_PATH, licenseData, licenseSha, `[XAYZBOT] Update license`); if (newSha) { licenseSha = newSha; renderDashboard(); alert("License key di Bluee Database berhasil diperbarui!"); } }
    function handleLogout() { currentUser = null; loginContainer.style.display = 'flex'; dashboardContainer.style.display = 'none'; loginForm.reset(); }
    
    loginForm.addEventListener('submit', handleLogin);
    logoutButton.addEventListener('click', handleLogout);
    createUserButton.addEventListener('click', handleCreateUser);
    addTokenBtn.addEventListener('click', handleAddToken);
    delTokenBtn.addEventListener('click', handleDelToken);
    remoteOnBtn.addEventListener('click', () => handleRemoteToggle('on'));
    remoteOffBtn.addEventListener('click', () => handleRemoteToggle('off'));
    setScriptIdBtn.addEventListener('click', handleSetScriptId);
    if(setLicenseBtn) { setLicenseBtn.addEventListener('click', handleSetLicense); }
    
    setRandomBackground();
    setupMusic();
    typeWriter();
});
