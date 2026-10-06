// ==========================================
// Constantes de Autenticação Segura (SHA-256)
// ==========================================
const VALID_USER = 'operador_vet';

// Hashes SHA-256 das senhas autorizadas
const VALID_PASS_HASH = '256a26df093771144ffe808bfa6127d56e69911e77b61458c23b223e5f91f6ad';
const VALID_PASS_HASH_ALT = '899f8eb7ff3b99dbfe595568ef5c1103c81216666df3b3e2182046fa32d43a67';

const SESSION_TOKEN_KEY = 'bompracachorro_token';
const SESSION_USER_KEY = 'bompracachorro_user';

// Regras de Bloqueio por Força Bruta
const MAX_ATTEMPTS = 4;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutos de bloqueio

let lockoutInterval = null;

// Função de hashing criptográfico SHA-256
async function sha256(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

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

    verificarBloqueioExistente();
}

// ==========================================
// Mecanismo de Bloqueio e Contagem Regressiva
// ==========================================
function verificarBloqueioExistente() {
    const lockoutExpiry = localStorage.getItem('lockoutExpiry');
    if (lockoutExpiry) {
        const tempoRestante = Number(lockoutExpiry) - Date.now();
        if (tempoRestante > 0) {
            iniciarContagemBloqueio(tempoRestante);
            return true;
        } else {
            redefinirTentativas();
        }
    }
    return false;
}

function redefinirTentativas() {
    if (lockoutInterval) clearInterval(lockoutInterval);
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('lockoutExpiry');

    const authAlert = document.getElementById('auth-alert');
    const btnSubmit = document.getElementById('btn-submit');
    const userInput = document.getElementById('username');
    const passInput = document.getElementById('password');

    if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Acessar Painel Pet 🐾';
    }
    if (userInput) userInput.disabled = false;
    if (passInput) passInput.disabled = false;
    if (authAlert) authAlert.classList.add('hidden');
}

function iniciarContagemBloqueio(duracaoInicial) {
    const authAlert = document.getElementById('auth-alert');
    const btnSubmit = document.getElementById('btn-submit');
    const userInput = document.getElementById('username');
    const passInput = document.getElementById('password');

    if (userInput) userInput.disabled = true;
    if (passInput) passInput.disabled = true;
    if (btnSubmit) btnSubmit.disabled = true;

    if (authAlert) authAlert.classList.remove('hidden');

    if (lockoutInterval) clearInterval(lockoutInterval);

    function atualizarMensagem() {
        const lockoutExpiry = Number(localStorage.getItem('lockoutExpiry') || 0);
        const agora = Date.now();
        const restanteMs = lockoutExpiry - agora;

        if (restanteMs <= 0) {
            redefinirTentativas();
            if (authAlert) {
                authAlert.textContent = 'Tempo esgotado. Pode tentar novamente.';
                authAlert.classList.remove('hidden');
            }
            return;
        }

        const minutos = Math.floor(restanteMs / 60000);
        const segundos = Math.floor((restanteMs % 60000) / 1000);
        const formatMin = String(minutos).padStart(2, '0');
        const formatSeg = String(segundos).padStart(2, '0');

        const texto = `⛔ Bloqueado após ${MAX_ATTEMPTS} tentativas falhas. Tente novamente em ${formatMin}:${formatSeg}`;

        if (authAlert) authAlert.textContent = texto;
        if (btnSubmit) btnSubmit.textContent = `Acesso Bloqueado (${formatMin}:${formatSeg})`;
    }

    atualizarMensagem();
    lockoutInterval = setInterval(atualizarMensagem, 1000);
}

// ==========================================
// Interação dos Botões de Abas / Serviços
// ==========================================
function setupAbas() {
    let btnAgendar = document.getElementById('tab-btn-agendamento');
    if (!btnAgendar) {
        document.querySelectorAll('button').forEach(btn => {
            if (btn.textContent.includes('Agendamento de Serviços')) btnAgendar = btn;
        });
    }

    const secaoPacientes = document.querySelector('.pets-section') || document.getElementById('tab-pacientes');
    let secaoAgendamento = document.getElementById('tab-agendamento');

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
            const painelAgendamentoAberto = secaoAgendamento && secaoAgendamento.style.display !== 'none';
            if (painelAgendamentoAberto) {
                secaoAgendamento.style.display = 'none';
                if (secaoPacientes) secaoPacientes.style.display = 'block';
                btnAgendar.textContent = '📅 Agendamento de Serviços';
                btnAgendar.style.background = '#2563eb';
            } else {
                if (secaoAgendamento) secaoAgendamento.style.display = 'block';
                if (secaoPacientes) secaoPacientes.style.display = 'none';
                btnAgendar.textContent = '🐶 Ver Pacientes do Dia';
                btnAgendar.style.background = '#059669';
                renderizarAgendamentos();
            }
        };
    }

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

            const formatData = new Date(dataHora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

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
// Inicialização e Validação do Login
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    setupAbas();

    const savedUser = sessionStorage.getItem(SESSION_USER_KEY);
    const savedToken = sessionStorage.getItem(SESSION_TOKEN_KEY);
    if (savedUser && savedToken) {
        showDashboard(savedUser);
        return;
    }

    verificarBloqueioExistente();

    const loginForm = document.getElementById('login-form');
    const authAlert = document.getElementById('auth-alert');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Bloqueia qualquer envio se o tempo de espera ainda estiver ativo
            if (verificarBloqueioExistente()) return;

            const usernameInput = document.getElementById('username')?.value.trim();
            const passwordInput = document.getElementById('password')?.value.trim();

            if (!usernameInput || !passwordInput) return;

            const inputHash = await sha256(passwordInput);

            if (usernameInput === VALID_USER && (inputHash === VALID_PASS_HASH || inputHash === VALID_PASS_HASH_ALT)) {
                // Sucesso: reseta histórico de falhas
                redefinirTentativas();

                const token = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
                sessionStorage.setItem(SESSION_TOKEN_KEY, token);
                sessionStorage.setItem(SESSION_USER_KEY, usernameInput);

                loginForm.reset();
                showDashboard(usernameInput);
            } else {
                // Falha: incrementa as tentativas
                let tentativas = Number(localStorage.getItem('loginAttempts') || 0) + 1;
                localStorage.setItem('loginAttempts', tentativas.toString());

                if (tentativas >= MAX_ATTEMPTS) {
                    const expiry = Date.now() + LOCKOUT_DURATION_MS;
                    localStorage.setItem('lockoutExpiry', expiry.toString());
                    iniciarContagemBloqueio(LOCKOUT_DURATION_MS);
                } else {
                    const restantes = MAX_ATTEMPTS - tentativas;
                    if (authAlert) {
                        authAlert.textContent = `Credenciais incorretas! Restam ${restantes} tentativa(s) antes do bloqueio.`;
                        authAlert.classList.remove('hidden');
                    }
                }
            }
        });
    }

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', showLogin);
    }
});
