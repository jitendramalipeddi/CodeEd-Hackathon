// js/ui.js
import * as dom from './dom.js';
import * as state from './state.js';

// --- View Switching ---
export function switchView(viewName) {
    dom.topicSelectionView.classList.add('hidden');
    dom.loadingView.classList.add('hidden');
    dom.dashboardView.classList.add('hidden');

    const viewMap = {
        'topic-selection': dom.topicSelectionView,
        'loading': dom.loadingView,
        'dashboard': dom.dashboardView
    };

    if (viewMap[viewName]) {
        viewMap[viewName].classList.remove('hidden');
    }
}

// --- Topic Selection View ---
export function renderSavedTopics() {
    const topics = state.getAllTopics();
    if (topics.length === 0) {
        dom.savedTopicsList.innerHTML = `<p class="text-slate-400">No modules created yet. Start by entering a topic above!</p>`;
        return;
    }

    dom.savedTopicsList.innerHTML = topics.map(topic => `
        <button class="w-full text-left bg-slate-100 p-3 rounded-lg hover:bg-indigo-100 transition" data-topic="${topic}">
            ${topic}
        </button>
    `).join('');
}

// --- Dashboard View ---
export function updateDashboard(topic) {
    const module = state.getModuleForTopic(topic);
    if (!module) {
        console.error("Could not find module for topic:", topic);
        switchView('topic-selection');
        return;
    }
    
    dom.topicTitle.textContent = module.topic;
    updateReviewCounts();
    renderPerformanceFeedback();
}

export function updateReviewCounts() {
    const topic = state.getCurrentTopic();
    const topicProgress = state.getProgressForTopic(topic);
    const module = state.getModuleForTopic(topic);
    if (!topicProgress || !module) return;
    
    const now = new Date().toISOString().split('T')[0];
    let flashcardCount = 0;
    let quizCount = 0;

    module.flashcards.forEach((_, i) => {
        const item = topicProgress.items[`f_${i}`];
        if (!item || new Date(item.nextReviewDate) <= new Date(now)) flashcardCount++;
    });
    module.quiz.forEach((_, i) => {
        const item = topicProgress.items[`q_${i}`];
        if (!item || new Date(item.nextReviewDate) <= new Date(now)) quizCount++;
    });

    dom.flashcardReviewCount.textContent = flashcardCount;
    dom.quizReviewCount.textContent = quizCount;
}

export function renderPerformanceFeedback() {
    const topic = state.getCurrentTopic();
    const history = state.getProgressForTopic(topic)?.performance?.quizHistory;

    if (history && history.length > 0) {
        const lastQuiz = history[history.length - 1];
        const lastScorePercent = Math.round(lastQuiz.score * 100);
        let message = `Your last quiz score was <strong>${lastScorePercent}%</strong>. `;
        message += lastScorePercent <= 70
            ? "We recommend reviewing the <strong>Short Reading</strong> and <strong>Flashcards</strong>."
            : "Excellent work! You're showing strong understanding.";
        
        dom.feedbackMessage.innerHTML = message;
        dom.performanceFeedback.classList.remove('hidden');
    } else {
        dom.performanceFeedback.classList.add('hidden');
    }
}

// --- Modal and Learning Content ---
function openModal(title) {
    dom.modalTitle.textContent = title;
    dom.learningModal.classList.remove('hidden');
}

export function closeModal() {
    dom.learningModal.classList.add('hidden');
    dom.modalBody.innerHTML = '';
    updateReviewCounts();
    renderPerformanceFeedback();
}

export function showInfoModal(title, message) {
    openModal(title);
    dom.modalBody.innerHTML = `
        <div class="text-center p-4">
            <p class="text-slate-600">${message}</p>
            <button id="close-info-btn" class="mt-6 bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-indigo-700 transition">Close</button>
        </div>
    `;
    document.getElementById('close-info-btn').addEventListener('click', closeModal);
}

export function showReading() {
    const module = state.getModuleForTopic(state.getCurrentTopic());
    openModal("Short Reading");
    dom.modalBody.innerHTML = `<div class="prose max-w-none"><p>${module.summary.replace(/\n/g, '<br>')}</p></div>`;
}

export function startFlashcards() {
    const topic = state.getCurrentTopic();
    const module = state.getModuleForTopic(topic);
    const now = new Date().toISOString().split('T')[0];
    const reviewItems = module.flashcards
        .map((card, index) => ({ ...card, index }))
        .filter(card => {
            const itemProgress = state.getProgressForTopic(topic).items[`f_${card.index}`];
            return !itemProgress || new Date(itemProgress.nextReviewDate) <= new Date(now);
        });

    if (reviewItems.length === 0) {
        showInfoModal("Flashcards", "No flashcards are due for review. Great job!");
        return;
    }
    openModal("Flashcards");
    let currentCardIndex = 0;

    function renderFlashcard() {
        if (currentCardIndex >= reviewItems.length) {
            dom.modalBody.innerHTML = `<div class="text-center p-8">
                <h3 class="text-2xl font-bold text-emerald-600">All Done!</h3>
                <p class="mt-2 text-slate-600">You've reviewed all due flashcards.</p>
                <button id="close-review-btn" class="mt-6 bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg">Close</button>
            </div>`;
            document.getElementById('close-review-btn').addEventListener('click', closeModal);
            return;
        }
        const cardData = reviewItems[currentCardIndex];
        dom.modalBody.innerHTML = `<div class="[perspective:1000px]">
            <div class="card relative w-full h-64">
                <div class="card-face absolute w-full h-full p-6 rounded-lg shadow-lg bg-slate-100 flex items-center justify-center text-center">
                    <p class="text-2xl">${cardData.term}</p>
                </div>
                <div class="card-face card-face-back absolute w-full h-full p-6 rounded-lg shadow-lg bg-indigo-100 flex items-center justify-center text-center">
                    <p class="text-lg">${cardData.definition}</p>
                </div>
            </div>
        </div>
        <div class="flex justify-center items-center mt-6 gap-4">
            <button id="flip-btn" class="text-indigo-600 font-semibold">Flip Card</button>
        </div>
        <div id="feedback-buttons" class="hidden flex justify-center items-center mt-4 gap-4">
            <button data-correct="false" class="bg-red-500 text-white font-semibold px-6 py-2 rounded-lg hover:bg-red-600">Incorrect</button>
            <button data-correct="true" class="bg-green-500 text-white font-semibold px-6 py-2 rounded-lg hover:bg-green-600">Correct</button>
        </div>`;
        
        const card = dom.modalBody.querySelector('.card');
        document.getElementById('flip-btn').addEventListener('click', () => {
            card.classList.add('is-flipped');
            document.getElementById('flip-btn').classList.add('hidden');
            document.getElementById('feedback-buttons').classList.remove('hidden');
        });
        document.getElementById('feedback-buttons').querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const isCorrect = e.target.dataset.correct === 'true';
                state.updateItemProgress(`f_${cardData.index}`, isCorrect);
                currentCardIndex++;
                renderFlashcard();
            });
        });
    }
    renderFlashcard();
}

export function startQuiz() {
    const topic = state.getCurrentTopic();
    const module = state.getModuleForTopic(topic);
    const now = new Date().toISOString().split('T')[0];
    const reviewItems = module.quiz
        .map((q, index) => ({ ...q, index }))
        .filter(q => {
            const itemProgress = state.getProgressForTopic(topic).items[`q_${q.index}`];
            return !itemProgress || new Date(itemProgress.nextReviewDate) <= new Date(now);
        });

    if (reviewItems.length === 0) {
        showInfoModal("Quiz", "No quiz questions are due for review. Well done!");
        return;
    }
    openModal("Quiz");
    let currentQuestionIndex = 0;
    let score = 0;

    function renderQuestion() {
        if (currentQuestionIndex >= reviewItems.length) {
            const finalScore = score / reviewItems.length;
            state.recordQuizPerformance(finalScore);
            dom.modalBody.innerHTML = `<div class="text-center p-8">
                <h3 class="text-2xl font-bold">Quiz Complete!</h3>
                <p class="mt-2 text-slate-600 text-lg">You scored ${score} out of ${reviewItems.length}.</p>
                <button id="close-quiz-btn" class="mt-6 bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg">Close</button>
            </div>`;
            document.getElementById('close-quiz-btn').addEventListener('click', closeModal);
            return;
        }
        
        const questionData = reviewItems[currentQuestionIndex];
        dom.modalBody.innerHTML = `<div>
            <p class="text-lg font-semibold mb-4">${currentQuestionIndex + 1}. ${questionData.question}</p>
            <div id="options-container" class="space-y-3">
                ${questionData.options.map(option => `
                    <button class="w-full text-left p-4 bg-slate-100 rounded-lg hover:bg-indigo-100 transition border-2 border-transparent">
                        ${option}
                    </button>
                `).join('')}
            </div>
            <p id="quiz-feedback" class="mt-4 font-semibold hidden"></p>
            <button id="next-question-btn" class="hidden mt-4 bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg">Next</button>
        </div>`;

        const optionsContainer = document.getElementById('options-container');
        optionsContainer.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => {
                optionsContainer.querySelectorAll('button').forEach(btn => btn.disabled = true);
                const selectedAnswer = button.textContent.trim();
                const isCorrect = selectedAnswer === questionData.answer;
                
                if (isCorrect) {
                    score++;
                    button.classList.add('bg-green-200', 'border-green-500');
                    document.getElementById('quiz-feedback').textContent = "Correct!";
                    document.getElementById('quiz-feedback').className = 'mt-4 font-semibold text-green-600';
                } else {
                    button.classList.add('bg-red-200', 'border-red-500');
                    document.getElementById('quiz-feedback').textContent = `Incorrect. The correct answer is: ${questionData.answer}`;
                    document.getElementById('quiz-feedback').className = 'mt-4 font-semibold text-red-600';
                    optionsContainer.querySelectorAll('button').forEach(btn => {
                        if(btn.textContent.trim() === questionData.answer) {
                            btn.classList.add('bg-green-200', 'border-green-500');
                        }
                    });
                }
                
                state.updateItemProgress(`q_${questionData.index}`, isCorrect);
                document.getElementById('quiz-feedback').classList.remove('hidden');
                document.getElementById('next-question-btn').classList.remove('hidden');
            });
        });
        document.getElementById('next-question-btn').addEventListener('click', () => {
            currentQuestionIndex++;
            renderQuestion();
        });
    }
    renderQuestion();
}