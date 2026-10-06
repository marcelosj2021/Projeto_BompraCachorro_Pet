// Configurações de segurança e autenticação administrativa
const VALID_USER_HASH = 'operador_vet';
const VALID_PASS_HASH = '256a26df093771144ffe808bfa6127d56e69911e77b61458c23b223e5f91f6ad';
const MAX_ATTEMPTS = 4;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutos em milissegundos

// Função auxiliar para calcular o hash SHA-256 no navegador
async function sha256(str) {
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Função de validação de autenticação
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

  // Verificação de bloqueio ativo
  const lockoutExpiry = localStorage.getItem('lockoutExpiry');
  if (lockoutExpiry && Date.now() < Number(lockoutExpiry)) {
    const minRestantes = Math.ceil((Number(lockoutExpiry) - Date.now()) / 60000);
    alert(`Limite de tentativas excedido. Acesso bloqueado por mais ${minRestantes} minuto(s).`);
    return;
  }

  // Cálculo do hash da palavra-passe inserida
  const passHash = await sha256(passInput);

  // Validação das credenciais
  if (userInput === VALID_USER_HASH && passHash === VALID_PASS_HASH) {
    // Sucesso na autenticação: limpa tentativas anteriores
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('lockoutExpiry');

    // Desbloqueia e apresenta o painel administrativo
    document.querySelectorAll('[id*="login"], [class*="login"], .overlay, .modal').forEach(el => el.remove());
    document.querySelectorAll('[id*="painel"], [id*="admin"], [class*="painel"], main, #app').forEach(el => {
      el.style.display = 'block';
      el.classList.remove('hidden', 'd-none');
    });
    document.body.style.overflow = 'auto';
  } else {
    // Falha na autenticação: controlo de tentativas
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

// Vinculação do evento de submissão do formulário
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm') || 
               document.querySelector('form') || 
               document.querySelector('button[type="submit"]');

  if (form) {
    form.addEventListener('submit', validarLogin);
    form.addEventListener('click', (e) => {
      if (e.target && e.target.tagName === 'BUTTON') validarLogin(e);
    });
  }
});
