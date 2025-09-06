// js/app.js
import * as dom from './dom.js';
import * as api from './api.js';
import * as state from './state.js';
import * as ui from './ui.js';

function loadDashboard(topic) {
    state.setCurrentTopic(topic);
    ui.updateDashboard(topic);
    ui.switchView('dashboard');
}

async function handleTopicSubmit(e) {
    e.preventDefault();
    dom.apiKeyError.classList.add('hidden');
    const topic = dom.topicInput.value.trim();
    if (!topic) return;
    
    ui.switchView('loading');

    try {
        const module = await api.generateModule(topic);
        state.initializeTopicProgress(topic, module);
        ui.renderSavedTopics();
        loadDashboard(topic);
    } catch (error) {
        console.error('Error generating content:', error);
        if (error.message.includes("API Key is missing")) {
            dom.apiKeyError.classList.remove('hidden');
        } else {
            ui.showInfoModal("Error", `Failed to generate module: ${error.message}`);
        }
        ui.switchView('topic-selection');
    }
}

function init() {
    state.loadProgress();
    ui.renderSavedTopics();

    dom.topicForm.addEventListener('submit', handleTopicSubmit);
    dom.backToTopicsBtn.addEventListener('click', () => ui.switchView('topic-selection'));
    dom.closeModalBtn.addEventListener('click', ui.closeModal);
    dom.startReadingBtn.addEventListener('click', ui.showReading);
    dom.startFlashcardsBtn.addEventListener('click', ui.startFlashcards);
    dom.startQuizBtn.addEventListener('click', ui.startQuiz);
    
    // Add event listener for saved topic buttons
    dom.savedTopicsList.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const topic = e.target.dataset.topic;
            loadDashboard(topic);
        }
    });
}

// --- Initialize App ---
document.addEventListener('DOMContentLoaded', init);