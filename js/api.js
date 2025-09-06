// js/api.js

import { GEMINI_API_KEY } from './config.js';

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are an expert instructional designer for corporate L&D. Your task is to generate a microlearning module on a given topic. The output must be a single, valid JSON object with no other text before or after it.
The JSON object must have the following structure:
{
  "topic": "The user's requested topic",
  "summary": "A concise, one-paragraph summary (3-5 sentences) of the topic's key principles, suitable for a corporate audience.",
  "flashcards": [
    {"term": "Key Term 1", "definition": "A clear and brief definition."},
    {"term": "Key Term 2", "definition": "A clear and brief definition."}
  ],
  "quiz": [
    {
      "question": "A multiple-choice question to test understanding.",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "The string of the correct option"
    }
  ]
}
Generate 5-8 flashcards and 4-6 quiz questions. Ensure the content is professional, accurate, and practical for the workplace.`;

export async function generateModule(topic) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
        throw new Error("API Key is missing. Please add your Gemini API Key to the js/config.js file.");
    }

    const payload = {
        contents: [{ parts: [{ text: `Generate a module for the topic: "${topic}"` }] }],
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    };

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.error.message}`);
    }

    const result = await response.json();
    const textContent = result.candidates[0].content.parts[0].text;
    const cleanedText = textContent.replace(/```json|```/g, '').trim();
    
    return JSON.parse(cleanedText);
}