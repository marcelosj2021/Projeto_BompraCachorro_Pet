// Configurações de segurança e credenciais
const VALID_USER = 'operador_vet';
const VALID_PASS_HASH = '256a26df093771144ffe808bfa6127d56e69911e77b61458c23b223e5f91f6ad';
const MAX_ATTEMPTS = 4;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutos em milissegundos

// Função para calcular o resumo SHA-256 no browser
async function sha256(str) {
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
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
