/**
 * Projeto_BompraCachorro_Pet - Camada Lógica e de Segurança
 * Diretrizes: Secure by Design & Mitigações OWASP Top 10
 */

// OWASP A03 (Anti-XSS): Sanitização estrita contra injeção de HTML
function sanitizeText(input) {
    if (typeof input !== 'string') return '';
    const tempDiv = document.createElement('div');
    tempDiv.textContent = input;
    return tempDiv.innerHTML;
}

// Criptografia e Hashing Unidirecional Seguro SHA-256 via Web Crypto API
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    // Elementos da interface de autenticação
    const loginView = document.getElementById('login-view');
    const dashboardView = document.getElementById('dashboard-view');
    const loginForm = document.getElementById('login-form');
    const authAlert = document.getElementById('auth-alert');
    const loggedUserDisplay = document.getElementById('logged-user-display');
    const btnLogout = document.getElementById('btn-logout');

    // Elementos de agendamento
    const bookingForm = document.getElementById('booking-form');
    const bookingAlert = document.getElementById('booking-alert');
    const petsList = document.getElementById('pets-list');
    const statAgendamentos = document.getElementById('stat-agendamentos-count');
    const statFila = document.getElementById('stat-fila-count');

    // Chaves de controle de sessão
    const SESSION_TOKEN_KEY = 'pbcp_auth_token';
    const SESSION_USER_KEY = 'pbcp_auth_user';

    // Hash SHA-256 da senha 'PetSeguro@2026'
    const VALID_USER = 'operador_vet';
    const VALID_PASS_HASH = '899f8eb7ff3b99dbfe595568ef5c1103c81216666df3b3e2182046fa32d43a67';

    // Checagem de sessão ativa ao carregar a página
    const activeToken = sessionStorage.getItem(SESSION_TOKEN_KEY);
    const activeUser = sessionStorage.getItem(SESSION_USER_KEY);

    if (activeToken && activeUser) {
        showDashboard(activeUser);
    }

    // Processamento do Formulário de Acesso com Verificação Criptográfica
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        hideAlert();

        const usernameInput = document.getElementById('username').value.trim();
        const passwordInput = document.getElementById('password').value;

        if (!usernameInput || !passwordInput) {
            showAlert('Informe o usuário e a chave de acesso.');
            return;
        }

        if (usernameInput.length > 30 || passwordInput.length > 64) {
            showAlert('Tamanho de credenciais fora dos limites permitidos.');
            return;
        }

        // Hashing assíncrono da senha digitada
        const inputHash = await sha256(passwordInput);

        if (usernameInput === VALID_USER && inputHash === VALID_PASS_HASH) {
            const sessionToken = crypto.randomUUID();
            sessionStorage.setItem(SESSION_TOKEN_KEY, sessionToken);
            sessionStorage.setItem(SESSION_USER_KEY, usernameInput);

            loginForm.reset();
            showDashboard(usernameInput);
        } else {
            showAlert('Credenciais inválidas. Tente novamente.');
        }
    });

    // Logout
    btnLogout.addEventListener('click', () => {
        sessionStorage.removeItem(SESSION_TOKEN_KEY);
        sessionStorage.removeItem(SESSION_USER_KEY);
        sessionStorage.clear();

        dashboardView.classList.add('hidden');
        loginView.classList.remove('hidden');
    });

    // Processamento de Novo Agendamento para Clientes
    bookingForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const clientName = sanitizeText(document.getElementById('client-name').value.trim());
        const petName = sanitizeText(document.getElementById('pet-name').value.trim());
        const serviceType = sanitizeText(document.getElementById('service-type').value);
        const bookingDate = sanitizeText(document.getElementById('booking-date').value);
        const bookingTime = sanitizeText(document.getElementById('booking-time').value);

        if (!clientName || !petName || !serviceType || !bookingDate || !bookingTime) {
            return;
        }

        // Criação de card dinâmico no painel
        const newCard = document.createElement('article');
        newCard.className = 'pet-card fade-in';
        newCard.innerHTML = `
            <div class="pet-avatar-wrapper">
                <img src="https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=600&q=80" alt="Pet Agendado" class="pet-avatar">
                <span class="badge-status badge-info">Horário Marcado</span>
            </div>
            <div class="pet-info">
                <h4>${petName} <span class="breed">Agendamento</span></h4>
                <p class="tutor"><strong>Tutor:</strong> ${clientName}</p>
                <p class="obs"><strong>Procedimento:</strong> ${serviceType}</p>
                <div class="pet-footer">
                    <span class="status-indicator info">● Marcado: ${bookingDate} às ${bookingTime}</span>
                </div>
            </div>
        `;

        petsList.prepend(newCard);

        // Atualização de contadores
        let currentTotal = parseInt(statAgendamentos.textContent, 10) || 0;
        statAgendamentos.textContent = currentTotal + 1;

        let filaTotal = parseInt(statFila.textContent, 10) || 0;
        statFila.textContent = filaTotal + 1;

        // Feedback de sucesso
        bookingAlert.textContent = `Agendamento confirmado para o pet "${petName}" em ${bookingDate} às ${bookingTime}!`;
        bookingAlert.classList.remove('hidden');

        bookingForm.reset();

        setTimeout(() => {
            bookingAlert.classList.add('hidden');
        }, 5000);
    });

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
