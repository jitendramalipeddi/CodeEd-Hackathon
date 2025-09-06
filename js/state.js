// js/state.js
import { SPACED_REPETITION_INTERVALS } from './config.js';

let userProgress = {};
let currentTopic = null;

export function getCurrentTopic() {
    return currentTopic;
}

export function setCurrentTopic(topic) {
    currentTopic = topic;
}

export function getModuleForTopic(topic) {
    return userProgress[topic]?.module;
}

export function getProgressForTopic(topic) {
    return userProgress[topic];
}

export function getAllTopics() {
    return Object.keys(userProgress);
}

export function loadProgress() {
    const saved = localStorage.getItem('auraLearnProgress');
    if (saved) {
        userProgress = JSON.parse(saved);
    }
}

function saveProgress() {
    localStorage.setItem('auraLearnProgress', JSON.stringify(userProgress));
}

export function initializeTopicProgress(topic, module) {
    if (!userProgress[topic]) {
        userProgress[topic] = {
            module: module,
            items: {}, // { id: { level, nextReviewDate } }
            performance: { quizHistory: [] }
        };
        saveProgress();
    }
}

export function updateItemProgress(itemId, isCorrect) {
    const topicProgress = userProgress[currentTopic];
    const item = topicProgress.items[itemId] || { level: 0 };
    
    if (isCorrect) {
        item.level = Math.min(item.level + 1, SPACED_REPETITION_INTERVALS.length);
    } else {
        item.level = 0;
    }

    const intervalDays = SPACED_REPETITION_INTERVALS[item.level - 1] || 0;
    const nextReviewDate = new Date();
    
    if(isCorrect) {
        nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);
    } else {
        nextReviewDate.setDate(nextReviewDate.getDate() + 1); // If wrong, review again tomorrow
    }

    item.nextReviewDate = nextReviewDate.toISOString().split('T')[0];
    topicProgress.items[itemId] = item;
    saveProgress();
}

export function recordQuizPerformance(score) {
    const topicProgress = userProgress[currentTopic];
    if (!topicProgress.performance) {
        topicProgress.performance = { quizHistory: [] };
    }
    topicProgress.performance.quizHistory.push({
        score: score,
        date: new Date().toISOString().split('T')[0]
    });
    saveProgress();
}