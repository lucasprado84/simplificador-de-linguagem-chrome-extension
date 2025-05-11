// DOM Elements
const wordInput = document.getElementById('word');
const alternativesInput = document.getElementById('alternatives');
const addWordButton = document.getElementById('add-word');
const glossaryList = document.getElementById('glossary-list');
const maxWordsInput = document.getElementById('max-words');
const saveSettingsButton = document.getElementById('save-settings');
const successMessage = document.getElementById('success-message');
const errorMessage = document.getElementById('error-message');

// Load existing glossary and settings
document.addEventListener('DOMContentLoaded', () => {
    loadGlossary();
    loadSettings();
});

// Load glossary from storage
function loadGlossary() {
    chrome.storage.local.get(['glossary'], (data) => {
        const glossary = data.glossary?.words || {};
        updateGlossaryTable(glossary);
    });
}

// Load settings from storage
function loadSettings() {
    chrome.storage.local.get(['glossary'], (data) => {
        const rules = data.glossary?.rules || {};
        maxWordsInput.value = rules.sentenceLength || 25;
    });
}

// Update glossary table
function updateGlossaryTable(glossary) {
    glossaryList.innerHTML = '';
    
    Object.entries(glossary).forEach(([word, alternatives]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${word}</td>
            <td>${alternatives.join(', ')}</td>
            <td>
                <button class="button-danger" onclick="deleteWord('${word}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        glossaryList.appendChild(row);
    });
}

// Add new word to glossary
addWordButton.addEventListener('click', () => {
    const word = wordInput.value.trim().toLowerCase();
    const alternatives = alternativesInput.value
        .split(',')
        .map(alt => alt.trim())
        .filter(alt => alt.length > 0);

    if (!word || alternatives.length === 0) {
        showError('Por favor, preencha todos os campos.');
        return;
    }

    chrome.storage.local.get(['glossary'], (data) => {
        const glossary = data.glossary || {};
        const words = glossary.words || {};
        
        words[word] = alternatives;
        glossary.words = words;

        chrome.storage.local.set({ glossary }, () => {
            updateGlossaryTable(words);
            wordInput.value = '';
            alternativesInput.value = '';
            showSuccess('Palavra adicionada com sucesso!');
        });
    });
});

// Delete word from glossary
window.deleteWord = function(word) {
    if (confirm('Tem certeza que deseja remover esta palavra?')) {
        chrome.storage.local.get(['glossary'], (data) => {
            const glossary = data.glossary || {};
            const words = glossary.words || {};
            
            delete words[word];
            glossary.words = words;

            chrome.storage.local.set({ glossary }, () => {
                updateGlossaryTable(words);
                showSuccess('Palavra removida com sucesso!');
            });
        });
    }
};

// Save settings
saveSettingsButton.addEventListener('click', () => {
    const maxWords = parseInt(maxWordsInput.value);
    
    if (maxWords < 10 || maxWords > 50) {
        showError('O número de palavras deve estar entre 10 e 50.');
        return;
    }

    chrome.storage.local.get(['glossary'], (data) => {
        const glossary = data.glossary || {};
        const rules = glossary.rules || {};
        
        rules.sentenceLength = maxWords;
        glossary.rules = rules;

        chrome.storage.local.set({ glossary }, () => {
            showSuccess('Configurações salvas com sucesso!');
        });
    });
});

// Show success message
function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    errorMessage.style.display = 'none';
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 3000);
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    successMessage.style.display = 'none';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 3000);
}

// Export glossary
window.exportGlossary = function() {
    chrome.storage.local.get(['glossary'], (data) => {
        const glossary = data.glossary || {};
        const blob = new Blob([JSON.stringify(glossary, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'glossario.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
};

// Import glossary
window.importGlossary = function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const glossary = JSON.parse(e.target.result);
                chrome.storage.local.set({ glossary }, () => {
                    updateGlossaryTable(glossary.words || {});
                    showSuccess('Glossário importado com sucesso!');
                });
            } catch (error) {
                showError('Erro ao importar o arquivo. Verifique se é um JSON válido.');
            }
        };
        reader.readAsText(file);
    }
};
