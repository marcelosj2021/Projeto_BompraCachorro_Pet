// ==========================================
// Constantes de Acesso e Segurança
// ==========================================
const VALID_USER = 'operador_vet';
const VALID_PASS = 'VetMaster@2026Secure';
const VALID_PASS_ALT = 'PetSeguro@2026';

const SESSION_TOKEN_KEY = 'bompracachorro_token';
const SESSION_USER_KEY = 'bompracachorro_user';

// Estado local de agendamentos
let agendamentos = [
    {
        pet: 'Max',
        raca: 'Beagle',
        tutor: 'Juliana Lima',
        servico: 'Consulta Veterinária',
        horario: 'Amanhã às 10:00'
    },
    {
        pet: 'Pipoca',
        raca: 'Shih Tzu',
        tutor: 'Marcos Roberto',
        servico: 'Banho & Tosa',
        horario: 'Amanhã às 14:30'
    }
];

// ==========================================
// Controlo de Visualização (Views)
// ==========================================
function showDashboard(username) {
    const loginView = document.getElementById('login-view');
    const dashboardView = document.getElementById('dashboard-view');
    const userDisplay = document.getElementById('logged-user-display');

    if (loginView) loginView.classList.add('hidden');
    if (dashboardView) dashboardView.classList.remove('hidden');
    if (userDisplay) userDisplay.textContent = username;

    renderizarAgendamentos();
}

function showLogin() {
    const loginView = document.getElementById('login-view');
    const dashboardView = document.getElementById('dashboard-view');

    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    sessionStorage.removeItem(SESSION_USER_KEY);

    if (dashboardView) dashboardView.classList.add('hidden');
    if (loginView) loginView.classList.remove('hidden');
}

// ==========================================
// Alternância de Abas
// ==========================================
function setupTabs() {
    const btnTabPacientes = document.getElementById('tab-btn-pacientes');
    const btnTabAgendamento = document.getElementById('tab-btn-agendamento');
    const tabPacientes = document.getElementById('tab-pacientes');
    const tabAgendamento = document.getElementById('tab-agendamento');

    if (btnTabPacientes && btnTabAgendamento) {
        btnTabPacientes.addEventListener('click', () => {
            tabPacientes.style.display = 'block';
            tabAgendamento.style.display = 'none';

            btnTabPacientes.style.background = '#2563eb';
            btnTabPacientes.style.color = '#fff';
            btnTabAgendamento.style.background = '#1e293b';
            btnTabAgendamento.style.color = '#94a3b8';
        });

        btnTabAgendamento.addEventListener('click', () => {
            tabPacientes.style.display = 'none';
            tabAgendamento.style.display = 'block';

            btnTabAgendamento.style.background = '#2563eb';
            btnTabAgendamento.style.color = '#fff';
            btnTabPacientes.style.background = '#1e293b';
            btnTabPacientes.style.color = '#94a3b8';
        });
    }
}

// ==========================================
// Gestão de Agendamentos
// ==========================================
function renderizarAgendamentos() {
    const container = document.getElementById('lista-agendamentos');
    if (!container) return;

    container.innerHTML = '';
    agendamentos.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'pet-card';
        card.innerHTML = `
            <div class="pet-info" style="width: 100%;">
                <h4>${item.pet} <span class="breed">${item.raca}</span></h4>
                <p class="tutor">👤 Tutor: <strong>${item.tutor}</strong></p>
                <p class="obs">🏷️ Serviço: <strong>${item.servico}</strong></p>
                <div class="pet-footer" style="display:flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                    <span class="status-indicator info">⏰ ${item.horario}</span>
                    <button onclick="removerAgendamento(${index})" style="background: transparent; border: 1px solid #ef4444; color: #ef4444; border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 0.75rem;">Cancelar</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

window.removerAgendamento = function(index) {
    agendamentos.splice(index, 1);
    renderizarAgendamentos();
};

function setupAgendamentoForm() {
    const formAg = document.getElementById('form-novo-agendamento');
    if (formAg) {
        formAg.addEventListener('submit', (e) => {
            e.preventDefault();
            const pet = document.getElementById('ag-pet-nome').value.trim();
            const raca = document.getElementById('ag-pet-raca').value.trim();
            const tutor = document.getElementById('ag-tutor-nome').value.trim();
            const servico = document.getElementById('ag-tipo-servico').value;
            const dataHora = document.getElementById('ag-data-hora').value;

            if (!pet || !tutor || !dataHora) return;

            const formatData = new Date(dataHora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

            agendamentos.unshift({
                pet,
                raca,
                tutor,
                servico,
                horario: formatData
            });

            formAg.reset();
            renderizarAgendamentos();
            alert(`Agendamento de ${pet} confirmado com sucesso!`);
        });
    }
}

// ==========================================
// Eventos e Inicialização do Sistema
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
    setupAgendamentoForm();

    // Verificação de sessão existente
    const savedUser = sessionStorage.getItem(SESSION_USER_KEY);
    const savedToken = sessionStorage.getItem(SESSION_TOKEN_KEY);
    if (savedUser && savedToken) {
        showDashboard(savedUser);
    }

    // Formulário de Login
    const loginForm = document.getElementById('login-form');
    const authAlert = document.getElementById('auth-alert');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const usernameInput = document.getElementById('username')?.value.trim();
            const passwordInput = document.getElementById('password')?.value.trim();

            if (usernameInput === VALID_USER && (passwordInput === VALID_PASS || passwordInput === VALID_PASS_ALT)) {
                if (authAlert) authAlert.classList.add('hidden');

                const sessionToken = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
                sessionStorage.setItem(SESSION_TOKEN_KEY, sessionToken);
                sessionStorage.setItem(SESSION_USER_KEY, usernameInput);

                loginForm.reset();
                showDashboard(usernameInput);
            } else {
                if (authAlert) {
                    authAlert.textContent = 'Identificação ou Chave de Acesso incorreta.';
                    authAlert.classList.remove('hidden');
                }
            }
        });
    }

    // Botão de Logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            showLogin();
        });
    }
});
