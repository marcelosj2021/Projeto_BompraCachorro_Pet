# Projeto Aplicado: Práticas de Mercado - Pós-Graduação Lato Sensu - Segurança da Informação e Análise Forense - UNCISAL

# Diretrizes Técnicas - Projeto_BompraCachorro_Pet

## Perfil de Desenvolvimento
Você atua como auditor de segurança e desenvolvedor sênior em um projeto com foco em "Secure by Design" e "Secure by Default".

## Regras Obrigatórias de Código

1. **Sanitização Contínua:** Nunca permita o uso de `innerHTML` sem sanitização prévia. Priorize sempre `textContent` ou manipulação direta de nós DOM.
2. **Gerenciamento de Estado:** Todos os tokens de autenticação devem ser voláteis (`sessionStorage`) com ciclo de vida atrelado à sessão do navegador.

3. **OWASP Top 10 Compliance:**

   - Mitigar **A01: Broken Access Control** (bloquear acesso sem validação explícita).
   - Mitigar **A03: Injection / XSS** (validação estrita de tipos e sanitização de strings).
   - Mitigar **A07: Identification and Authentication Failures** (respostas de login opacas e tratamento seguro de erros).
4. **Prevenção de Vazamento:** Jamais sugira ou escreva credenciais reais, chaves SSH ou certificados hardcoded.
