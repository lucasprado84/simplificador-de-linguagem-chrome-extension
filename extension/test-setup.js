// Mock Chrome Extension APIs for testing
window.chrome = {
    storage: {
        local: {
            get: function(keys, callback) {
                console.log('Loading glossary...');
                // Mock glossary data for testing
                callback({
                    glossary: {
                        words: {
                            "implementar": ["fazer", "criar", "desenvolver"],
                            "mediante": ["após", "depois de", "com"],
                            "subsequentes": ["seguintes", "próximos", "posteriores"],
                            "posteriormente": ["depois", "mais tarde", "em seguida"],
                            "pormenorizada": ["detalhada", "minuciosa", "completa"],
                            "aferir": ["medir", "avaliar", "verificar"],
                            "acurada": ["precisa", "exata", "correta"],
                            "stakeholders": ["interessados", "participantes", "envolvidos"],
                            "deployment": ["implantação", "instalação", "distribuição"],
                            "feature": ["funcionalidade", "recurso", "característica"],
                            "backend": ["servidor", "sistema", "base"],
                            "upload": ["envio", "carregamento", "transferência"],
                            "update": ["atualização", "modificação", "alteração"],
                            "dashboard": ["painel", "tela", "interface"],
                            "deadline": ["prazo", "data limite", "término"],
                            "roadmap": ["planejamento", "roteiro", "plano"],
                            "ab initio": ["desde o início", "do começo", "inicialmente"],
                            "acórdão": ["decisão", "sentença", "julgamento"],
                            "monitória": ["cobrança", "pagamento", "dívida"]
                        },
                        rules: {
                            sentenceLength: 25
                        }
                    }
                });
            },
            set: function(data, callback) {
                if (callback) callback();
            }
        }
    },
    runtime: {
        sendMessage: function(message) {
            console.log('Message sent:', message);
        },
        onMessage: {
            addListener: function(callback) {
                window.addEventListener('message', (event) => {
                    if (event.data.type === 'chromeMessage') {
                        callback(event.data.message);
                    }
                });
            }
        }
    },
    contextMenus: {
        create: function() {},
        remove: function() {},
        onClicked: {
            addListener: function() {}
        }
    }
};

// Wait for both DOM and scripts to be loaded
window.addEventListener('load', () => {
    console.log('Setting up test environment...');
    
    // Ensure content.js is loaded and initialized
    if (typeof initializeExtension === 'function') {
        console.log('Initializing extension...');
        initializeExtension();
        
        // Force a re-scan after a short delay
        setTimeout(() => {
            console.log('Re-scanning page...');
            if (typeof scanPage === 'function') {
                scanPage(document.body);
            }
        }, 500);
    } else {
        console.error('Extension initialization function not found');
    }
});

// Debug helper
window.addEventListener('error', (e) => {
    console.error('Runtime error:', e.error);
});
