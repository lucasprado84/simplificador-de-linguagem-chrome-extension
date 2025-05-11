# Instruções de Teste - Simplificador de Linguagem

Este documento contém instruções detalhadas para testar todas as funcionalidades da extensão Simplificador de Linguagem.

## Preparação do Ambiente

1. **Instalar a Extensão**
   ```bash
   # No Chrome
   1. Abra chrome://extensions/
   2. Ative o "Modo do desenvolvedor"
   3. Clique em "Carregar sem compactação"
   4. Selecione a pasta 'extension'
   ```

2. **Iniciar o Servidor de Teste**
   ```bash
   python3 -m http.server 8000
   ```

3. **Acessar a Página de Teste**
   ```
   http://localhost:8000/test.html
   ```

## Casos de Teste

### 1. Detecção de Palavras Complexas

- **Objetivo**: Verificar se a extensão identifica corretamente palavras complexas
- **Passos**:
  1. Observe as palavras sublinhadas na seção "Palavras Complexas"
  2. Verifique se palavras como "implementar", "mediante", "subsequentes" estão marcadas
  3. Passe o mouse sobre as palavras marcadas para ver o tooltip

### 2. Menu de Contexto

- **Objetivo**: Testar a funcionalidade de sugestões de palavras simples
- **Passos**:
  1. Clique com botão direito em uma palavra sublinhada
  2. Verifique se o menu de contexto aparece com alternativas
  3. Selecione uma alternativa e confirme a substituição
  4. Observe a animação de destaque na palavra substituída

### 3. Análise de Frases

- **Objetivo**: Verificar a detecção de estruturas complexas
- **Passos**:
  1. Observe a seção "Frases Longas"
  2. Verifique se frases com mais de 25 palavras são marcadas
  3. Confira se a voz passiva é identificada na seção correspondente
  4. Teste se a ordem indireta é detectada nos exemplos

### 4. Edição em Tempo Real

- **Objetivo**: Testar a detecção dinâmica de texto
- **Passos**:
  1. Abra o console do navegador (F12)
  2. Digite texto novo em qualquer parte da página
  3. Verifique se novas palavras complexas são detectadas automaticamente
  4. Confirme se as marcações são atualizadas em tempo real

### 5. Página de Opções

- **Objetivo**: Testar a interface de gerenciamento
- **Passos**:
  1. Clique no ícone da extensão
  2. Acesse "Opções"
  3. Teste adicionar uma nova palavra ao glossário
  4. Verifique se a palavra aparece na lista
  5. Teste remover uma palavra
  6. Ajuste o número máximo de palavras por frase
  7. Salve as alterações e verifique se foram aplicadas

### 6. Casos Especiais

- **Objetivo**: Verificar comportamento em situações específicas
- **Passos**:
  1. Teste com texto em campos de formulário
  2. Verifique comportamento em texto editável
  3. Teste com conteúdo dinâmico (AJAX)
  4. Verifique em iframes (se aplicável)

## Verificação de Regras

### Regra 1: Palavras Simples
- [ ] Identifica termos complexos
- [ ] Sugere alternativas adequadas
- [ ] Mantém o contexto na substituição

### Regra 2: Termos Técnicos
- [ ] Detecta siglas e termos estrangeiros
- [ ] Oferece explicações em português
- [ ] Identifica jargões profissionais

### Regra 3: Estrutura de Frases
- [ ] Marca frases longas (>25 palavras)
- [ ] Identifica voz passiva
- [ ] Detecta ordem indireta

### Regra 4: Linguagem Inclusiva
- [ ] Identifica termos discriminatórios
- [ ] Sugere alternativas neutras
- [ ] Mantém consistência nas sugestões

## Relatório de Bugs

Para reportar problemas, inclua:

1. Descrição do problema
2. Passos para reproduzir
3. Comportamento esperado
4. Comportamento atual
5. Screenshots (se aplicável)
6. Versão do navegador
7. Versão da extensão

## Notas de Teste

- A extensão deve funcionar em todas as páginas web
- O desempenho não deve ser afetado significativamente
- As substituições devem manter a gramática correta
- O histórico do navegador deve funcionar normalmente
- A extensão deve respeitar a privacidade do usuário
