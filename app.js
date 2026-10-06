// Configurações de segurança e credenciais
const VALID_USER = 'operador_vet';
const VALID_PASS_HASH = '256a26df093771144ffe808bfa6127d56e69911e77b61458c23b223e5f91f6ad';
const MAX_ATTEMPTS = 4;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutos em milissegundos

// Função para calcular o resumo SHA-256 no browser
async function sha256(str) {
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);/**
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
        const VALID_USER = 'operador_vet';
        const VALID_PASS = 'PetSeguro@2026';

        if (usernameInput === VALID_USER && passwordInput === VALID_PASS) {
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
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Função de validação de login
async function validarLogin(event) {
  if (event) event.preventDefault();

  const userField = document.getElementById('username') || 
                    document.getElementById('operador') || 
                    document.querySelector('input[type="text"]');
  const passField = document.getElementById('password') || 
                    document.getElementById('senha') || 
                    document.querySelector('input[type="password"]');

  const userInput = (userField ? userField.value : '').trim();
  const passInput = (passField ? passField.value : '').trim();

  // Verifica bloqueio de tentativas
  const lockoutExpiry = localStorage.getItem('lockoutExpiry');
  if (lockoutExpiry && Date.now() < Number(lockoutExpiry)) {
    const minRestantes = Math.ceil((Number(lockoutExpiry) - Date.now()) / 60000);
    alert(`Limite de tentativas excedido. Acesso bloqueado por mais ${minRestantes} minuto(s).`);
    return;
  }

  // Gera o hash da palavra-passe inserida
  const passHash = await sha256(passInput);

  // Validação: aceita utilizador e compara o hash da senha
  if (userInput === VALID_USER && passHash === VALID_PASS_HASH) {
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('lockoutExpiry');

    // Remove ecrã/modal de autenticação e revela o painel
    document.querySelectorAll('[id*="login"], [class*="login"], .overlay, .modal').forEach(el => el.remove());
    document.querySelectorAll('[id*="painel"], [id*="admin"], [class*="painel"], main, #app').forEach(el => {
      el.style.display = 'block';
      el.classList.remove('hidden', 'd-none');
    });
    document.body.style.overflow = 'auto';
  } else {
    let attempts = Number(localStorage.getItem('loginAttempts') || 0) + 1;
    localStorage.setItem('loginAttempts', attempts.toString());

    if (attempts >= MAX_ATTEMPTS) {
      localStorage.setItem('lockoutExpiry', (Date.now() + LOCKOUT_TIME).toString());
      alert('Limite de 4 tentativas excedido. Acesso bloqueado por 15 minutos.');
    } else {
      alert(`Credenciais inválidas! Tentativa ${attempts} de ${MAX_ATTEMPTS}.`);
    }
  }
}

// Registo dos eventos após carregamento do DOM
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm') || 
               document.querySelector('form') || 
               document.querySelector('button[type="submit"]');

  if (form) {
    form.addEventListener('submit', validarLogin);
    form.addEventListener('click', (e) => {
      if (e.target && (e.target.tagName === 'BUTTON' || e.target.type === 'submit')) {
        validarLogin(e);
      }
    });
  }
});
