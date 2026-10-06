/**
 * Projeto_BompraCachorro_Pet - Camada Logica e de Seguranca
 * Diretrizes: Secure by Design & Mitigacoes OWASP Top 10 (A07 - Identification & Auth Failures)
 */

// OWASP A03: Sanitizacao estrita contra XSS
function sanitizeText(input) {
    if (typeof input !== 'string') return '';
    const tempDiv = document.createElement('div');
    tempDiv.textContent = input;
    return tempDiv.innerHTML;
}

// Funcao nativa Web Cryptography API para calculo de SHA-256
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    const loginView = document.getElementById('login-view');
    const dashboardView = document.getElementById('dashboard-view');
    const loginForm = document.getElementById('login-form');
    const authAlert = document.getElementById('auth-alert');
    const loggedUserDisplay = document.getElementById('logged-user-display');
    const btnLogout = document.getElementById('btn-logout');
    const submitBtn = loginForm ? loginForm.querySelector('button[type="submit"]') : null;

    // Chaves de controle de sessao e controle de forca bruta
    const SESSION_TOKEN_KEY = 'pbcp_auth_token';
    const SESSION_USER_KEY  = 'pbcp_auth_user';
    const ATTEMPTS_KEY      = 'pbcp_failed_attempts';
    const LOCKOUT_KEY       = 'pbcp_lockout_until';

    const MAX_ATTEMPTS  = 4;
    const LOCKOUT_TIME  = 15 * 60 * 1000; // 15 minutos em milissegundos

// Hash SHA-256 da credencial administrativa de acesso
const VALID_USER_HASH = 'operador_vet';
const VALID_PASS_HASH = '2ea6373b57ba23ee9e5bc5fa371e549da7752b0f2095f9c5d0124fe72b0c3995';
    
    // OWASP A01: Validacao de sessao previa
    const activeToken = sessionStorage.getItem(SESSION_TOKEN_KEY);
    const activeUser  = sessionStorage.getItem(SESSION_USER_KEY);
    if (activeToken && activeUser) {
        showDashboard(activeUser);
    }

    // Valida se o utilizador esta em periodo de bloqueio
    function checkLockout() {
        const lockoutUntil = parseInt(localStorage.getItem(LOCKOUT_KEY), 10);
        if (lockoutUntil && Date.now() < lockoutUntil) {
            const minutesLeft = Math.ceil((lockoutUntil - Date.now()) / 60000);
            showAlert(`Acesso temporariamente bloqueado por excesso de tentativas falhadas. Tente novamente em ${minutesLeft} minuto(s).`);
            if (submitBtn) submitBtn.disabled = true;
            return true;
        } else if (lockoutUntil && Date.now() >= lockoutUntil) {
            localStorage.removeItem(LOCKOUT_KEY);
            localStorage.setItem(ATTEMPTS_KEY, '0');
            if (submitBtn) submitBtn.disabled = false;
            hideAlert();
        }
        return false;
    }

    checkLockout();

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            hideAlert();

            if (checkLockout()) return;

            const usernameInput = document.getElementById('username').value.trim();
            const passwordInput = document.getElementById('password').value;

            if (!usernameInput || !passwordInput) {
                showAlert('Informe o usuario e a senha de acesso.');
                return;
            }

            if (usernameInput.length > 30 || passwordInput.length > 64) {
                showAlert('Tamanho de credenciais fora dos limites permitidos.');
                return;
            }

            const hashedInput = await sha256(passwordInput);

            if (usernameInput === VALID_USER_HASH && hashedInput === VALID_PASS_HASH) {
                localStorage.removeItem(ATTEMPTS_KEY);
                localStorage.removeItem(LOCKOUT_KEY);

                const sessionToken = crypto.randomUUID();
                sessionStorage.setItem(SESSION_TOKEN_KEY, sessionToken);
                sessionStorage.setItem(SESSION_USER_KEY, usernameInput);

                loginForm.reset();
                showDashboard(usernameInput);
            } else {
                let failedAttempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0', 10) + 1;
                localStorage.setItem(ATTEMPTS_KEY, failedAttempts.toString());

                if (failedAttempts >= MAX_ATTEMPTS) {
                    const lockoutDeadline = Date.now() + LOCKOUT_TIME;
                    localStorage.setItem(LOCKOUT_KEY, lockoutDeadline.toString());
                    if (submitBtn) submitBtn.disabled = true;
                    showAlert('Limite de 4 tentativas excedido. Acesso bloqueado por 15 minutos.');
                } else {
                    const remaining = MAX_ATTEMPTS - failedAttempts;
                    showAlert(`Credenciais invalidas. Restam ${remaining} tentativa(s) antes do bloqueio.`);
                }
            }
        });
    }

    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            sessionStorage.removeItem(SESSION_TOKEN_KEY);
            sessionStorage.removeItem(SESSION_USER_KEY);
            sessionStorage.clear();

            dashboardView.classList.add('hidden');
            loginView.classList.remove('hidden');
        });
    }

    function showDashboard(user) {
        loginView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        loggedUserDisplay.textContent = sanitizeText(user);
    }

    function showAlert(message) {
        authAlert.textContent = message;
        authAlert.classList.remove('hidden');
    }

    function hideAlert() {
        authAlert.textContent = '';
        authAlert.classList.add('hidden');
    }
});
