// Global variables
let glossary = {};
let rules = {};

// Helper functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Setup observer for Google Docs iframe
function setupGoogleDocsObserver() {
    try {
        const iframe = document.querySelector('iframe.docs-texteventtarget-iframe');
        if (iframe && iframe.contentDocument) {
            const docBody = iframe.contentDocument.body;
            observeGoogleDocs(docBody);
        }
    } catch (e) {
        console.error('Google Docs observer setup failed:', e);
    }
}

// Setup observer for Gmail editor
function setupGmailObserver() {
    try {
        const gmailEditor = document.querySelector('div[aria-label="Corpo da mensagem"]');
        if (gmailEditor) {
            observeGmail(gmailEditor);
        }
    } catch (e) {
        console.error('Gmail observer setup failed:', e);
    }
}

// Observe Google Docs content changes
function observeGoogleDocs(docBody) {
    if (!docBody) return;
    const observer = new MutationObserver(() => {
        scanPage(docBody);
    });
    observer.observe(docBody, { childList: true, subtree: true, characterData: true });
    scanPage(docBody);
}

// Observe Gmail editor changes
function observeGmail(editor) {
    if (!editor) return;
    const observer = new MutationObserver(() => {
        scanPage(editor);
    });
    observer.observe(editor, { childList: true, subtree: true, characterData: true });
    scanPage(editor);
}

// Setup special editors (Google Docs, Gmail)
function setupSpecialEditors() {
    // Try to setup Google Docs
    setupGoogleDocsObserver();
    // Try to setup Gmail
    setupGmailObserver();
    // Periodically check for editors (they might load dynamically)
    setInterval(() => {
        setupGoogleDocsObserver();
        setupGmailObserver();
    }, 5000);
}

// Initialize the extension
function initializeExtension() {
    // Load glossary and rules
    chrome.storage.local.get(['glossary'], function(data) {
        glossary = data.glossary?.words || defaultGlossary;
        rules = data.glossary?.rules || { sentenceLength: 25 };
        
        // Start observing DOM changes
        observePageChanges();
        // Initial scan
        scanPage();
        // Setup special editors
        setupSpecialEditors();
    });
}

// Default glossary for testing
const defaultGlossary = {
    "implementar": ["fazer", "criar", "desenvolver"],
    "mediante": ["após", "depois de", "com"],
    "subsequentes": ["seguintes", "próximos", "posteriores"],
    "posteriormente": ["depois", "mais tarde", "em seguida"],
    "pormenorizada": ["detalhada", "minuciosa", "completa"],
    "aferir": ["medir", "avaliar", "verificar"],
    "acurada": ["precisa", "exata", "correta"],
    "stakeholders": ["interessados", "participantes", "envolvidos"],
    "feedback": ["retorno", "resposta", "avaliação"],
    "deployment": ["implantação", "instalação", "distribuição"],
    "feature": ["funcionalidade", "recurso", "característica"],
    "backend": ["servidor", "sistema", "base"],
    "upload": ["envio", "carregamento", "transferência"],
    "update": ["atualização", "modificação", "alteração"],
    "dashboard": ["painel", "tela", "interface"],
    "deadline": ["prazo", "data limite", "término"],
    "roadmap": ["planejamento", "roteiro", "plano"]
};

// Observe page changes
function observePageChanges() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        scanNode(node);
                    }
                });
            } else if (mutation.type === 'characterData') {
                scanNode(mutation.target.parentNode);
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });
}

// Scan the entire page or a specific node
function scanPage(rootNode = document.body) {
    console.log('Scanning page for complex words...');
    
    // Reset any existing highlights
    rootNode.querySelectorAll('.lt-underline').forEach(el => {
        if (el.dataset.word) {
            el.replaceWith(el.dataset.word);
        }
    });
    
    // Scan the content
    scanNode(rootNode);
    
    console.log('Page scan complete');
}

// Scan a node and its children
function scanNode(node) {
    if (!node || isNodeIgnored(node)) return;

    try {
        // Handle special editors
        if (isGoogleDocsEditor(node)) {
            handleGoogleDocsNode(node);
            return;
        }
        if (isGmailEditor(node)) {
            handleGmailNode(node);
            return;
        }

        // Handle regular editable content
        if (isEditableNode(node)) {
            handleEditableNode(node);
            return;
        }

        // Process text nodes
        const walker = document.createTreeWalker(
            node,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    const parent = node.parentElement;
                    if (!parent || isNodeIgnored(parent)) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    // Skip if parent already has highlighting
                    if (parent.classList && parent.classList.contains('lt-underline')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        let textNode;
        while (textNode = walker.nextNode()) {
            processTextNode(textNode);
        }

        // Analyze sentences in paragraphs
        if (node.tagName === 'P' || node.parentNode.tagName === 'P') {
            analyzeSentence(node);
        }
    } catch (e) {
        console.error('Error scanning node:', e);
    }
}

// Check if node is Google Docs editor
function isGoogleDocsEditor(node) {
    return node.classList && (
        node.classList.contains('kix-canvas-tile-content') ||
        node.classList.contains('docs-texteventtarget-iframe')
    );
}

// Check if node is Gmail editor
function isGmailEditor(node) {
    return node.getAttribute('aria-label') === 'Corpo da mensagem' ||
           node.classList && node.classList.contains('gmail_default');
}

// Handle Google Docs node
function handleGoogleDocsNode(node) {
    const observer = new MutationObserver(debounce(() => {
        const text = node.textContent;
        if (text) {
            processTextContent(node, text);
        }
    }, 500));

    observer.observe(node, {
        childList: true,
        subtree: true,
        characterData: true
    });
}

// Handle Gmail node
function handleGmailNode(node) {
    const observer = new MutationObserver(debounce(() => {
        const text = node.textContent;
        if (text) {
            processTextContent(node, text);
        }
    }, 500));

    observer.observe(node, {
        childList: true,
        subtree: true,
        characterData: true
    });
}

// Process text content for special editors
function processTextContent(node, text) {
    const words = text.match(/\b\w+\b/g) || [];
    words.forEach(word => {
        const alternatives = glossary[word.toLowerCase()];
        if (alternatives) {
            try {
                const range = document.createRange();
                const sel = window.getSelection();
                range.selectNodeContents(node);
                sel.removeAllRanges();
                sel.addRange(range);
                
                const regex = new RegExp(`\\b${word}\\b`, 'g');
                const replacement = `<span class="lt-underline" data-alternatives='${JSON.stringify(alternatives)}'>${word}</span>`;
                document.execCommand('insertHTML', false, text.replace(regex, replacement));
            } catch (e) {
                console.error('Failed to process text in special editor:', e);
            }
        }
    });
}

// Check if node should be ignored
function isNodeIgnored(node) {
    if (!node) return true;
    
    const ignoredTags = ['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA'];
    const ignoredClasses = ['lt-underline', 'lt-replaced'];
    
    return (
        ignoredTags.includes(node.tagName) ||
        node.isContentEditable ||
        ignoredClasses.some(cls => node.classList?.contains(cls))
    );
}

// Check if node is editable
function isEditableNode(node) {
    return (
        node.isContentEditable ||
        node.tagName === 'INPUT' ||
        node.tagName === 'TEXTAREA'
    );
}

// Handle editable nodes
function handleEditableNode(node) {
    node.addEventListener('input', debounce(() => {
        const text = node.value || node.textContent;
        const processed = processText(text);
        
        if (node.value !== undefined) {
            node.value = processed;
        } else {
            node.textContent = processed;
        }
    }, 500));
}

// Process text node
function processTextNode(node) {
    const text = node.textContent;
    if (!text.trim()) return;

    const words = text.match(/\b\w+\b/g) || [];
    let hasComplexWords = false;
    let html = text;

    words.forEach(word => {
        const lower = word.toLowerCase();
        if (glossary[lower]) {
            hasComplexWords = true;
            const regex = new RegExp(`\\b${word}\\b`, 'g');
            html = html.replace(regex, (match) => {
                const alternatives = JSON.stringify(glossary[lower]);
                return `<span class="lt-underline" data-word="${match}" data-alternatives='${alternatives}'>${match}</span>`;
            });
        }
    });

    if (hasComplexWords) {
        const wrapper = document.createElement('span');
        wrapper.innerHTML = html;
        
        // Add event listeners
        wrapper.querySelectorAll('.lt-underline').forEach(el => {
            // Remove existing listeners if any
            const newEl = el.cloneNode(true);
            el.parentNode.replaceChild(newEl, el);
            
            // Add click listener
            newEl.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                showAlternatives(e);
            });
            
            // Add right-click listener
            newEl.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();
                showAlternatives(e);
            });
        });

        try {
            node.parentNode.replaceChild(wrapper, node);
        } catch (e) {
            console.error('Failed to replace text node:', e);
        }
    }
}

// Show alternatives for complex words
function showAlternatives(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const word = e.target;
    if (!word.classList.contains('lt-underline')) return;
    
    const alternatives = JSON.parse(word.dataset.alternatives);
    const originalWord = word.dataset.word;
    
    // Remove existing menus
    document.querySelectorAll('.lt-context-menu').forEach(m => m.remove());
    
    // Create menu
    const menu = document.createElement('div');
    menu.className = 'lt-context-menu';
    
    // Calculate position
    const rect = word.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    
    menu.style.position = 'absolute';
    menu.style.left = `${rect.left + scrollX}px`;
    menu.style.top = `${rect.bottom + scrollY}px`;
    menu.style.zIndex = '999999';

    // Add title
    const title = document.createElement('div');
    title.className = 'lt-context-menu-title';
    title.textContent = `Sugestões para "${originalWord}":`;
    menu.appendChild(title);

    // Add alternatives
    alternatives.forEach(alt => {
        const item = document.createElement('div');
        item.className = 'lt-context-menu-item';
        item.textContent = alt;
        item.onclick = (event) => {
            event.stopPropagation();
            word.textContent = alt;
            word.classList.add('lt-replaced');
            word.title = `Original: ${originalWord}`;
            menu.remove();
        };
        menu.appendChild(item);
    });

    document.body.appendChild(menu);

    // Position adjustment if menu goes off-screen
    const menuRect = menu.getBoundingClientRect();
    if (menuRect.right > window.innerWidth) {
        menu.style.left = `${window.innerWidth - menuRect.width - 10}px`;
    }
    if (menuRect.bottom > window.innerHeight) {
        menu.style.top = `${rect.top + scrollY - menuRect.height}px`;
    }

    // Close menu when clicking outside
    function closeMenu(event) {
        if (!menu.contains(event.target) && event.target !== word) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
            document.removeEventListener('scroll', closeMenu);
        }
    }
    
    // Close menu on scroll
    document.addEventListener('scroll', closeMenu);
    
    // Add click listener with a slight delay to prevent immediate closure
    setTimeout(() => {
        document.addEventListener('click', closeMenu);
    }, 0);
}

// Analyze sentence structure
function analyzeSentence(node) {
    const text = node.textContent;
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];

    sentences.forEach(sentence => {
        // Check sentence length
        const words = sentence.split(/\s+/).length;
        if (words > rules.sentenceLength) {
            markSentence(node, sentence, 'lt-long-sentence', 
                'Frase longa: considere dividir em frases menores');
        }

        // Check for passive voice
        if (hasPassiveVoice(sentence)) {
            markSentence(node, sentence, 'lt-passive-voice',
                'Voz passiva: considere usar voz ativa');
        }

        // Check for indirect order
        if (hasIndirectOrder(sentence)) {
            markSentence(node, sentence, 'lt-complex-structure',
                'Ordem indireta: use ordem direta (Sujeito > Verbo > Complemento)');
        }
    });
}

// Mark sentence with specific style
function markSentence(node, sentence, className, title) {
    const regex = new RegExp(sentence.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (node.innerHTML) {
        node.innerHTML = node.innerHTML.replace(
            regex,
            `<span class="${className}" title="${title}">${sentence}</span>`
        );
    }
}

// Helper functions
function hasPassiveVoice(sentence) {
    const patterns = [
        /\b(é|são|foi|foram|será|serão)\s+\w+[do|da|dos|das]\b/i,
        /\b(estava|estavam|estará|estarão)\s+\w+[do|da|dos|das]\b/i
    ];
    return patterns.some(pattern => pattern.test(sentence));
}

function hasIndirectOrder(sentence) {
    const patterns = [
        /^(Ao|Após|Quando|Para)\s/i,
        /^Em\s+\w+\s+[^,]+,/i,
        /^[^,]+,\s+\w+\s+[^,]+$/i
    ];
    return patterns.some(pattern => pattern.test(sentence));
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
    initializeExtension();
}
