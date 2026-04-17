import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock generation logic matching frontend
const generateMockQuestions = (topic, questionCount) => {
  const questions = [];
  const topicLowerCase = topic.toLowerCase();
  
  if (topicLowerCase.includes('javascript') || topicLowerCase.includes('programming')) {
    questions.push({
      id: 1,
      question: 'Which of the following is NOT a JavaScript data type?',
      answerOptions: ['String', 'Boolean', 'Float', 'Symbol'],
      correctAnswer: 'Float',
      explanation: 'JavaScript has primitive data types: String, Number, BigInt, Boolean, Symbol, Undefined, and Null. Float is not a distinct data type in JavaScript; floating-point numbers are part of the Number type.',
      type: 'multiple-choice'
    });
  } else {
    questions.push({
      id: 1,
      question: `What is the primary focus of ${topic}?`,
      type: 'open-ended',
      explanation: `This question tests basic understanding of the field of ${topic} and its core principles.`
    });
  }
  
  while (questions.length < questionCount) {
    questions.push({
      id: questions.length + 1,
      question: `Question ${questions.length + 1} about ${topic}?`,
      answerOptions: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option B',
      explanation: 'Generic placeholder explanation.',
      type: 'multiple-choice'
    });
  }
  return questions;
};

export const generateQuestions = async (req, res) => {
  const { topic, difficulty, learningStyle, questionCount } = req.body;
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  console.log("API Key length:", apiKey ? apiKey.length : 0);

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.log('Using mock AI generator due to missing API key.');
    return res.status(200).json({
      questions: generateMockQuestions(topic, questionCount)
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an educational AI. Generate ${questionCount} questions about ${topic}. The difficulty level is ${difficulty}. The questions should be tailored for a ${learningStyle} learner. Provide the output strictly as a JSON array of objects. Do not include any markdown format or code blocks around the JSON. 
Each object must have the following keys:
- 'id': a numeric ID
- 'question': the question text
- 'type': strictly one of 'multiple-choice', 'open-ended', or 'true-false'
- 'explanation': a brief explanation of the correct answer
- 'answerOptions': an array of strings (only if type is 'multiple-choice' or 'true-false', omit otherwise)
- 'correctAnswer': a string containing the exact correct answer (omit if 'open-ended')`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();

    const questions = JSON.parse(text);
    return res.status(200).json({ questions });
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback if API fails
    return res.status(200).json({
      questions: generateMockQuestions(topic, questionCount)
    });
  }
};

import SavedQuestion from '../models/SavedQuestion.js';
import { isDbConnected } from '../index.js';

export const saveQuestion = async (req, res) => {
  const { userId, topic, questionText, options, correctAnswer, explanation, difficulty } = req.body;

  if (!isDbConnected()) {
    return res.status(200).json({ message: 'Question saved (Mock Mode)' });
  }

  try {
    const saved = await SavedQuestion.create({
      userId, topic, questionText, options, correctAnswer, explanation, difficulty
    });
    res.status(201).json({ message: 'Question saved successfully', saved });
  } catch (error) {
    console.error('Error saving question:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSavedQuestions = async (req, res) => {
  const { userId } = req.params;

  if (!isDbConnected()) {
    return res.status(200).json({ questions: [] });
  }

  try {
    const questions = await SavedQuestion.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ questions });
  } catch (error) {
    console.error('Error fetching saved questions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
