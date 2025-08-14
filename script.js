document.addEventListener('DOMContentLoaded', () => {

    const GITHUB_TOKEN = 'ghp_Hxxxx'; // 👈 PASTE TOKEN GITHUB ANDA DI SINI
    const REPO_OWNER = 'Xayztech'; // 👈 GANTI DENGAN USERNAME GITHUB ANDA
    const REPO_NAME = 'Root-System-Core';   // 👈 GANTI DENGAN NAMA REPO ANDA
    const USER_FILE_PATH = 'web-users.json'; // File untuk login panel
    const TOKEN_FILE_PATH = 'Ubuntu-sudo-root.json';
    const REMOTE_FILE_PATH = 'idlinux.json';
    const LICENSE_FILE_PATH = 'Main-sudo-copyright.txy';

    // Elemen DOM
    const loginContainer = document.getElementById('login-container');
    const dashboardContainer = document.getElementById('dashboard-container');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const loadingIndicator = document.getElementById('loading-indicator');
    const logoutButton = document.getElementById('logout-button');
    const userRoleDisplay = document.getElementById('user-role-display');
    const welcomeTextElement = document.getElementById('welcome-text');

    // Widget User
    const createUserWidget = document.getElementById('create-user-widget');
    const newUsernameInput = document.getElementById('new-username');
    const newPasswordInput = document.getElementById('new-password');
    const newRoleSelect = document.getElementById('new-role-select');
    const createUserButton = document.getElementById('create-user-button');
    
    // Widget Token
    const tokenListDiv = document.getElementById('token-list');
    const tokenInput = document.getElementById('token-input');
    const addTokenBtn = document.getElementById('add-token-btn');
    const delTokenBtn = document.getElementById('del-token-btn');

    // Widget Remote
    const remoteStatusDisplay = document.getElementById('remote-status-display');
    const remoteOnBtn = document.getElementById('remote-on-btn');
    const remoteOffBtn = document.getElementById('remote-off-btn');
    const scriptIdInput = document.getElementById('script-id-input');
    const setScriptIdBtn = document.getElementById('set-script-id-btn');

    // Widget License
    const licenseKeyDisplay = document.getElementById('license-key-display');
    const licenseKeyInput = document.getElementById('license-key-input');
    const setLicenseBtn = document.getElementById('set-license-btn');

    // State Aplikasi
    let currentUser = null;
    let allPanelUsers = [], usersSha;
    let tokenData = { tokens: [] }, tokenSha;
    let remoteData = { status: 'off', id_script: ''}, remoteSha;
    let licenseData = "", licenseSha;

    // === FUNGSI ANIMASI TEKS ===
    const welcomeMessage = "👋 Hello, Welcome to the Official Bluee Database Website... || Creator: XΛYZ ƬΣᄃΉ";
    let i = 0;
    function typeWriter() {
        if (i < welcomeMessage.length) {
            welcomeTextElement.innerHTML += welcomeMessage.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        }
    }

    // === FUNGSI HELPER GITHUB API ===
    const GITHUB_API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/`;

    async function getGithubFile(filePath) {
        try {
            const response = await fetch(`${GITHUB_API_URL}${filePath}?t=${new Date().getTime()}`, {
                headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
            });
            if (!response.ok) {
                if(response.status === 404) return { data: null, sha: null };
                throw new Error(`Gagal ambil file: ${response.statusText}`);
            }
            const file = await response.json();
            const content = (file.encoding === 'base64') ? atob(file.content) : file.content;
            const data = filePath.endsWith('.json') ? JSON.parse(content) : content;
            return { data: data, sha: file.sha };
        } catch (e) { console.error(`Error getGithubFile (${filePath}):`, e); return { data: null, sha: null }; }
    }

    async function updateGithubFile(filePath, dataToSave, currentSha, commitMessage) {
        loadingIndicator.style.display = 'block';
        try {
            const content = (typeof dataToSave === 'string') ? dataToSave : JSON.stringify(dataToSave, null, 2);
            const encodedContent = btoa(unescape(encodeURIComponent(content)));
            const body = { message: commitMessage, content: encodedContent, sha: currentSha };
            
            const response = await fetch(GITHUB_API_URL + filePath, {
                method: 'PUT',
                headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (!response.ok) throw new Error(`Gagal simpan file: ${response.statusText}`);
            const result = await response.json();
            return result.content.sha;
        } catch (e) {
            console.error(`Error updateGithubFile (${filePath}):`, e);
            alert(`Gagal menyimpan file ${filePath}. Cek konsol (F12).`);
            return null;
        } finally {
            loadingIndicator.style.display = 'none';
        }
    }
    
    // === LOGIKA INTI APLIKASI ===
    async function handleLogin(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        loadingIndicator.style.display = 'block';
        const userResult = await getGithubFile(USER_FILE_PATH);
        loadingIndicator.style.display = 'none';
        
        if (!userResult.data) return alert("KRITIS: Gagal memuat file web-users.json. Pastikan file ada di repo Anda.");
        
        allPanelUsers = userResult.data;
        usersSha = userResult.sha;

        currentUser = allPanelUsers.find(u => u.username === username && u.password === password);
        if (currentUser) {
            loginContainer.style.display = 'none';
            dashboardContainer.style.display = 'flex';
            await loadInitialDashboardData();
        } else {
            loginError.textContent = "Username atau Password salah!";
        }
    }
    
    async function loadInitialDashboardData() {
        loadingIndicator.style.display = 'block';
        const [tokenResult, remoteResult, licenseResult] = await Promise.all([
            getGithubFile(TOKEN_FILE_PATH),
            getGithubFile(REMOTE_FILE_PATH),
            getGithubFile(LICENSE_FILE_PATH)
        ]);
        loadingIndicator.style.display = 'none';

        if (tokenResult.data) { tokenData = tokenResult.data; tokenSha = tokenResult.sha; }
        if (remoteResult.data) { remoteData = remoteResult.data; remoteSha = remoteResult.sha; }
        if (licenseResult.data) { licenseData = licenseResult.data; licenseSha = licenseResult.sha; }
        
        renderDashboard();
    }

    function getManagableRoles(role) {
        const allRoles = ['developer', 'owner', 'tk', 'pt', 'reseller'];
        const userRoleIndex = allRoles.indexOf(role);
        if (userRoleIndex === -1) return [];
        return allRoles.slice(userRoleIndex);
    }
    
    function renderDashboard() {
        if (!currentUser) return;
        userRoleDisplay.textContent = currentUser.role.toUpperCase();
        
        tokenListDiv.innerHTML = '';
        (tokenData.tokens || []).forEach(token => { const p = document.createElement('p'); p.textContent = `• ${token}`; tokenListDiv.appendChild(p); });
        remoteStatusDisplay.textContent = `${remoteData.status.toUpperCase()} | ID: ${remoteData.id_script}`;
        scriptIdInput.value = remoteData.id_script;
        licenseKeyDisplay.textContent = licenseData;

        document.querySelectorAll('.admin-only, .dev-only').forEach(el => el.style.display = 'none');
        
        if (currentUser.role !== 'reseller') {
            document.querySelector('.admin-only').style.display = 'block';
            const manageableRoles = getManagableRoles(currentUser.role);
            newRoleSelect.innerHTML = '';
            if (manageableRoles.length > 0) {
                 manageableRoles.forEach(role => {
                    const option = document.createElement('option');
                    option.value = role;
                    option.textContent = role.charAt(0).toUpperCase() + role.slice(1);
                    newRoleSelect.appendChild(option);
                });
                createUserButton.disabled = false;
            } else {
                const option = document.createElement('option');
                option.textContent = 'Tidak ada hak akses';
                newRoleSelect.appendChild(option);
                createUserButton.disabled = true;
            }
        }
        
        if (currentUser.role === 'developer') {
            document.querySelectorAll('.dev-only').forEach(el => el.style.display = 'block');
        }
    }

    // === FUNGSI-FUNGSI AKSI ===
    async function handleCreateUser() {
        const newUsername = newUsernameInput.value.trim();
        const newPassword = newPasswordInput.value.trim();
        if (!newUsername || !newPassword) return alert("Input tidak boleh kosong!");
        if (allPanelUsers.some(user => user.username === newUsername)) return alert(`Username "${newUsername}" sudah ada.`);
        
        const newUser = { id: (allPanelUsers.length > 0 ? Math.max(...allPanelUsers.map(u => u.id)) + 1 : 1), username: newUsername, password: newPassword, role: newRoleSelect.value };
        allPanelUsers.push(newUser);
        
        const newSha = await updateGithubFile(USER_FILE_PATH, allPanelUsers, usersSha, `[PANEL] Create user ${newUsername}`);
        if (newSha) { usersSha = newSha; alert(`SUKSES! Pengguna "${newUsername}" telah disimpan ke GitHub.`); newUsernameInput.value = ''; newPasswordInput.value = ''; }
    }
    
    async function handleAddToken() { 
        const token = tokenInput.value.trim(); 
        if (!token) { alert("Token tidak boleh kosong!"); return; } 
        if (!tokenData.tokens) { tokenData.tokens = []; }
        if (tokenData.tokens.includes(token)) { alert("Token sudah ada."); return; } 
        tokenData.tokens.push(token); 
        const newSha = await updateGithubFile(TOKEN_FILE_PATH, tokenData, tokenSha, `[PANEL] Add token`); 
        if (newSha) { tokenSha = newSha; tokenInput.value = ''; renderDashboard(); alert("Token berhasil ditambahkan ke GitHub!"); } 
    }
    async function handleDelToken() { 
        const token = tokenInput.value.trim(); 
        if (!token) { alert("Token tidak boleh kosong!"); return; } 
        const index = tokenData.tokens.indexOf(token); 
        if (index === -1) { alert("Token tidak ditemukan."); return; } 
        tokenData.tokens.splice(index, 1); 
        const newSha = await updateGithubFile(TOKEN_FILE_PATH, tokenData, tokenSha, `[PANEL] Delete token`); 
        if (newSha) { tokenSha = newSha; tokenInput.value = ''; renderDashboard(); alert("Token berhasil dihapus dari GitHub!"); } 
    }
    async function handleRemoteToggle(status) { 
        remoteData.status = status; 
        const newSha = await updateGithubFile(REMOTE_FILE_PATH, remoteData, remoteSha, `[PANEL] Remote ${status.toUpperCase()}`); 
        if (newSha) { remoteSha = newSha; renderDashboard(); alert(`Remote status di GitHub diubah menjadi ${status.toUpperCase()}!`); } 
    }
    async function handleSetScriptId() { 
        const newId = scriptIdInput.value.trim(); 
        if (!newId) return; 
        remoteData.id_script = newId; 
        const newSha = await updateGithubFile(REMOTE_FILE_PATH, remoteData, remoteSha, `[PANEL] Update script ID`); 
        if (newSha) { remoteSha = newSha; renderDashboard(); alert("ID Script di GitHub berhasil diperbarui!"); } 
    }
    async function handleSetLicense() { 
        const newLicense = licenseKeyInput.value.trim(); 
        if (!newLicense) return; 
        licenseData = newLicense; 
        const newSha = await updateGithubFile(LICENSE_FILE_PATH, licenseData, licenseSha, `[PANEL] Update license`); 
        if (newSha) { licenseSha = newSha; renderDashboard(); alert("License key di GitHub berhasil diperbarui!"); } 
    }
    
    function handleLogout() { 
        currentUser = null; 
        loginContainer.style.display = 'flex'; 
        dashboardContainer.style.display = 'none'; 
        document.getElementById('login-form').reset(); 
    }
    
    // === Event Listeners & Inisialisasi ===
    loginForm.addEventListener('submit', handleLogin);
    logoutButton.addEventListener('click', handleLogout);
    createUserButton.addEventListener('click', handleCreateUser);
    addTokenBtn.addEventListener('click', handleAddToken);
    delTokenBtn.addEventListener('click', handleDelToken);
    remoteOnBtn.addEventListener('click', () => handleRemoteToggle('on'));
    remoteOffBtn.addEventListener('click', () => handleRemoteToggle('off'));
    setScriptIdBtn.addEventListener('click', handleSetScriptId);
    setLicenseBtn.addEventListener('click', handleSetLicense);

    // Memulai animasi teks saat halaman dimuat
    typeWriter();
});
