# Simplificador de Linguagem

Uma extensão Chrome que ajuda a simplificar textos em português, tornando-os mais acessíveis e fáceis de entender.

## Funcionalidades

- Identifica palavras complexas automaticamente
- Sugere alternativas mais simples através do menu de contexto
- Analisa estrutura das frases para:
  - Identificar frases muito longas
  - Detectar voz passiva
  - Sugerir ordem direta (Sujeito > Verbo > Complemento)
- Interface de gerenciamento de glossário
- Regras de linguagem simples incorporadas

## Regras de Linguagem Simples

1. **Use palavras simples**
   - Evite palavras rebuscadas
   - Prefira termos do dia a dia

2. **Evite termos técnicos**
   - Não use siglas sem explicação
   - Evite termos estrangeiros
   - Evite jargões profissionais

3. **Estruture frases simples**
   - Use frases curtas (20-25 palavras)
   - Siga a ordem direta: Sujeito > Verbo > Complemento
   - Use verbos na voz ativa

4. **Use linguagem inclusiva**
   - Evite termos discriminatórios
   - Use os dois gêneros ou termos neutros
   - Considere a diversidade do público

## Instalação

1. Clone este repositório ou baixe os arquivos
2. Abra o Chrome e vá para `chrome://extensions/`
3. Ative o "Modo do desenvolvedor"
4. Clique em "Carregar sem compactação"
5. Selecione a pasta `extension` do projeto

## Uso

1. Navegue em qualquer página web
2. Palavras complexas serão sublinhadas com uma linha pontilhada vermelha
3. Clique com o botão direito em uma palavra sublinhada
4. Escolha uma alternativa mais simples no menu de contexto

## Configurações

1. Clique no ícone da extensão
2. Selecione "Opções"
3. Você pode:
   - Adicionar/remover palavras do glossário
   - Definir alternativas para palavras
   - Ajustar o número máximo de palavras por frase
   - Visualizar as regras de simplificação

## Desenvolvimento

### Estrutura do Projeto

```
extension/
├── manifest.json      # Configuração da extensão
├── background.js     # Script de background
├── content.js       # Script injetado nas páginas
├── options.html     # Página de opções
├── options.js       # Script da página de opções
├── style.css       # Estilos da extensão
├── glossary.json   # Banco de palavras e alternativas
└── icons/          # Ícones da extensão
```

### Tecnologias Utilizadas

- JavaScript (ES6+)
- Chrome Extension API
- HTML5
- CSS3

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Crie um Pull Request

## Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## Agradecimentos

- Baseado nas melhores práticas de linguagem simples
- Inspirado no [LanguageTool](https://github.com/languagetool-org/languagetool)
- Contribuições da comunidade de acessibilidade
