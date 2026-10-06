// ==========================================
// Constantes de Autenticação e Chaves
// ==========================================
const VALID_USER = 'operador_vet';
const VALID_PASS = 'VetMaster@2026Secure';
const VALID_PASS_ALT = 'PetSeguro@2026';

const SESSION_TOKEN_KEY = 'bompracachorro_token';
const SESSION_USER_KEY = 'bompracachorro_user';

// Base de dados local de agendamentos
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
// Gestão de Ecrãs (Login / Dashboard)
// ==========================================
function showDashboard(username) {
    const loginView = document.getElementById('login-view');
    const dashboardView = document.getElementById('dashboard-view');
    const userDisplay = document.getElementById('logged-user-display');

    if (loginView) loginView.classList.add('hidden');
    if (dashboardView) {
        dashboardView.classList.remove('hidden');
        dashboardView.style.display = 'block';
    }
    if (userDisplay) userDisplay.textContent = username;

    renderizarAgendamentos();
}

function showLogin() {
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    sessionStorage.removeItem(SESSION_USER_KEY);
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('lockoutExpiry');

    const loginView = document.getElementById('login-view');
    const dashboardView = document.getElementById('dashboard-view');

    if (dashboardView) {
        dashboardView.classList.add('hidden');
        dashboardView.style.display = 'none';
    }
    if (loginView) {
        loginView.classList.remove('hidden');
        loginView.style.display = 'block';
    }
}

// ==========================================
// Interacção dos Botões de Abas / Serviços
// ==========================================
function setupAbas() {
    // Procura o botão de agendamento por ID ou pelo texto
    let btnAgendar = document.getElementById('tab-btn-agendamento');
    if (!btnAgendar) {
        document.querySelectorAll('button').forEach(btn => {
            if (btn.textContent.includes('Agendamento de Serviços')) btnAgendar = btn;
        });
    }

    const secaoPacientes = document.querySelector('.pets-section') || document.getElementById('tab-pacientes');
    let secaoAgendamento = document.getElementById('tab-agendamento');

    // Se o elemento do agendamento não existir no HTML, cria a estrutura dinamicamente
    if (!secaoAgendamento && secaoPacientes) {
        secaoAgendamento = document.createElement('div');
        secaoAgendamento.id = 'tab-agendamento';
        secaoAgendamento.style.display = 'none';
        secaoAgendamento.innerHTML = `
            <div class="section-title-bar" style="margin: 20px 0 10px 0;">
                <h3 style="color:#fff;">📅 Formulário de Agendamento</h3>
            </div>
            <div style="background: #111827; padding: 20px; border-radius: 12px; border: 1px solid #1f2937; margin-bottom: 20px;">
                <form id="form-novo-agendamento" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px;">
                    <div>
                        <label style="color:#94a3b8; font-size:0.85rem; display:block; margin-bottom:4px;">Nome do Pet</label>
                        <input type="text" id="ag-pet-nome" placeholder="Ex: Rex" required style="width:100%; padding:10px; border-radius:6px; background:#1e293b; border:1px solid #334155; color:#fff;">
                    </div>
                    <div>
                        <label style="color:#94a3b8; font-size:0.85rem; display:block; margin-bottom:4px;">Raça</label>
                        <input type="text" id="ag-pet-raca" placeholder="Ex: Poodle" required style="width:100%; padding:10px; border-radius:6px; background:#1e293b; border:1px solid #334155; color:#fff;">
                    </div>
                    <div>
                        <label style="color:#94a3b8; font-size:0.85rem; display:block; margin-bottom:4px;">Tutor</label>
                        <input type="text" id="ag-tutor-nome" placeholder="Ex: Carlos" required style="width:100%; padding:10px; border-radius:6px; background:#1e293b; border:1px solid #334155; color:#fff;">
                    </div>
                    <div>
                        <label style="color:#94a3b8; font-size:0.85rem; display:block; margin-bottom:4px;">Serviço</label>
                        <select id="ag-tipo-servico" style="width:100%; padding:10px; border-radius:6px; background:#1e293b; border:1px solid #334155; color:#fff;">
                            <option value="Banho & Tosa">Banho & Tosa</option>
                            <option value="Consulta Veterinária">Consulta Veterinária</option>
                            <option value="Vacinação">Vacinação & Medicamentos</option>
                        </select>
                    </div>
                    <div>
                        <label style="color:#94a3b8; font-size:0.85rem; display:block; margin-bottom:4px;">Data e Hora</label>
                        <input type="datetime-local" id="ag-data-hora" required style="width:100%; padding:10px; border-radius:6px; background:#1e293b; border:1px solid #334155; color:#fff;">
                    </div>
                    <div style="display:flex; align-items:flex-end;">
                        <button type="submit" style="width:100%; padding:12px; background:#10b981; border:none; border-radius:6px; color:#fff; font-weight:bold; cursor:pointer;">Agendar Agora 🐾</button>
                    </div>
                </form>
            </div>
            <div class="section-title-bar" style="margin: 20px 0 10px 0;">
                <h3 style="color:#fff;">📋 Agendamentos Marcados</h3>
            </div>
            <div id="lista-agendamentos" class="pets-grid"></div>
        `;
        secaoPacientes.parentNode.insertBefore(secaoAgendamento, secaoPacientes.nextSibling);
    }

    if (btnAgendar) {
        btnAgendar.onclick = () => {
            const painelAgendamentoAberto = secaoAgendamento.style.display !== 'none';
            if (painelAgendamentoAberto) {
                // Alterna de volta para Pacientes
                secaoAgendamento.style.display = 'none';
                if (secaoPacientes) secaoPacientes.style.display = 'block';
                btnAgendar.textContent = '📅 Agendamento de Serviços';
                btnAgendar.style.background = '#2563eb';
            } else {
                // Exibe o painel de Agendamento
                secaoAgendamento.style.display = 'block';
                if (secaoPacientes) secaoPacientes.style.display = 'none';
                btnAgendar.textContent = '🐶 Ver Pacientes do Dia';
                btnAgendar.style.background = '#059669';
                renderizarAgendamentos();
            }
        };
    }

    // Formulário de submissão do agendamento
    const formAg = document.getElementById('form-novo-agendamento');
    if (formAg) {
        formAg.onsubmit = (e) => {
            e.preventDefault();
            const pet = document.getElementById('ag-pet-nome')?.value.trim();
            const raca = document.getElementById('ag-pet-raca')?.value.trim();
            const tutor = document.getElementById('ag-tutor-nome')?.value.trim();
            const servico = document.getElementById('ag-tipo-servico')?.value;
            const dataHora = document.getElementById('ag-data-hora')?.value;

            if (!pet || !tutor || !dataHora) return;

            const formatData = new Date(dataHora).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' });

            agendamentos.unshift({ pet, raca, tutor, servico, horario: formatData });
            formAg.reset();
            renderizarAgendamentos();
            alert(`Sucesso: Agendamento para ${pet} guardado!`);
        };
    }
}

// ==========================================
// Renderização de Agendamentos
// ==========================================
function renderizarAgendamentos() {
    const container = document.getElementById('lista-agendamentos');
    if (!container) return;

    container.innerHTML = '';
    agendamentos.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'pet-card';
        card.style.cssText = 'background: #1e293b; padding: 16px; border-radius: 10px; margin-bottom: 12px; border: 1px solid #334155; color: #fff;';
        card.innerHTML = `
            <div class="pet-info">
                <h4>${item.pet} <span style="font-size: 0.8rem; color: #38bdf8;">(${item.raca})</span></h4>
                <p>👤 Tutor: <strong>${item.tutor}</strong></p>
                <p>🏷️ Serviço: <strong>${item.servico}</strong></p>
                <div style="display:flex; justify-content: space-between; align-items:center; margin-top: 10px;">
                    <span style="color:#f59e0b; font-weight:600;">⏰ ${item.horario}</span>
                    <button onclick="removerAgendamento(${index})" style="background:transparent; border:1px solid #ef4444; color:#ef4444; border-radius:4px; padding:4px 8px; cursor:pointer;">Cancelar</button>
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

// ==========================================
// Inicialização
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    setupAbas();

    // Verificação de sessão
    const savedUser = sessionStorage.getItem(SESSION_USER_KEY);
    const savedToken = sessionStorage.getItem(SESSION_TOKEN_KEY);
    if (savedUser && savedToken) {
        showDashboard(savedUser);
    }

    // Formulário de Login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById('username')?.value.trim();
            const passwordInput = document.getElementById('password')?.value.trim();

            if (usernameInput === VALID_USER && (passwordInput === VALID_PASS || passwordInput === VALID_PASS_ALT)) {
                const token = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
                sessionStorage.setItem(SESSION_TOKEN_KEY, token);
                sessionStorage.setItem(SESSION_USER_KEY, usernameInput);
                loginForm.reset();
                showDashboard(usernameInput);
            } else {
                alert('Credenciais inválidas!');
            }
        });
    }

    // Botão de Logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', showLogin);
    }
});
