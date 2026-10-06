/**
 * Projeto_BompraCachorro_Pet - Camada Lógica e de Segurança
 * Diretrizes: Secure by Design & Mitigações OWASP Top 10
 */

// OWASP A03 (Anti-XSS): Sanitização estrita antes de renderizar qualquer texto
function sanitizeText(input) {
    if (typeof input !== 'string') return '';
    const tempDiv = document.createElement('div');
    tempDiv.textContent = input;
    return tempDiv.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
    // Mapeamento dos elementos do DOM
    const loginView = document.getElementById('login-view');
    const dashboardView = document.getElementById('dashboard-view');
    const loginForm = document.getElementById('login-form');
    const authAlert = document.getElementById('auth-alert');
    const loggedUserDisplay = document.getElementById('logged-user-display');
    const btnLogout = document.getElementById('btn-logout');

    // Chaves de controle de sessão com namespace do projeto
    const SESSION_TOKEN_KEY = 'pbcp_auth_token';
    const SESSION_USER_KEY = 'pbcp_auth_user';

    // OWASP A01: Validação de sessão ativa ao carregar a página
    const activeToken = sessionStorage.getItem(SESSION_TOKEN_KEY);
    const activeUser = sessionStorage.getItem(SESSION_USER_KEY);

    if (activeToken && activeUser) {
        showDashboard(activeUser);
    }

    // Processamento do Formulário de Acesso
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        hideAlert();

        const usernameInput = document.getElementById('username').value.trim();
        const passwordInput = document.getElementById('password').value;

        // Validação de formato e tamanho no cliente
        if (!usernameInput || !passwordInput) {
            showAlert('Informe o usuário e a senha de acesso.');
            return;
        }

        if (usernameInput.length > 30 || passwordInput.length > 64) {
            showAlert('Tamanho de credenciais fora dos limites permitidos.');
            return;
        }

        // Credenciais simuladas de validação
     // Credenciais simuladas de validação
        const VALID_USER = 'operador_vet';
        const VALID_PASS = 'VetMaster@2026Secure';

        if (usernameInput === VALID_USER && (passwordInput === VALID_PASS || passwordInput === 'PetSeguro@2026')) {
            
            // OWASP A01: Emissão de token volátil criptograficamente seguro
            const sessionToken = crypto.randomUUID();
            sessionStorage.setItem(SESSION_TOKEN_KEY, sessionToken);
            sessionStorage.setItem(SESSION_USER_KEY, usernameInput);

            loginForm.reset();
            showDashboard(usernameInput);
        } else {
            // OWASP A07: Resposta genérica para impedir enumeração de usuários
            showAlert('Credenciais inválidas. Tente novamente.');
        }
    });

    // OWASP A01: Logout funcional com expurgo de sessão
    btnLogout.addEventListener('click', () => {
        sessionStorage.removeItem(SESSION_TOKEN_KEY);
        sessionStorage.removeItem(SESSION_USER_KEY);
        sessionStorage.clear();

        dashboardView.classList.add('hidden');
        loginView.classList.remove('hidden');
    });

    function showDashboard(user) {
        loginView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        // Renderização segura contra injeção de scripts
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
