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
import { mockSavedQuestions } from '../mockDb.js';

export const saveQuestion = async (req, res) => {
  const { userId, topic, questionText, options, correctAnswer, explanation, difficulty } = req.body;

  if (!isDbConnected()) {
    const saved = { 
      _id: Math.random().toString(36).substring(2, 9),
      userId, 
      topic, 
      questionText, 
      options, 
      correctAnswer, 
      explanation, 
      difficulty, 
      createdAt: new Date() 
    };
    mockSavedQuestions.push(saved);
    return res.status(201).json({ message: 'Question saved successfully (Mock Mode)', saved });
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
    const questions = mockSavedQuestions.filter(q => q.userId === userId);
    return res.status(200).json({ questions });
  }

  try {
    const questions = await SavedQuestion.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ questions });
  } catch (error) {
    console.error('Error fetching saved questions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteSavedQuestion = async (req, res) => {
  const { id } = req.params;

  if (!isDbConnected()) {
    const index = mockSavedQuestions.findIndex(q => q._id === id);
    if (index > -1) {
      mockSavedQuestions.splice(index, 1);
      return res.status(200).json({ message: 'Question removed successfully (Mock Mode)' });
    }
    return res.status(404).json({ message: 'Question not found in mock database' });
  }

  try {
    const deleted = await SavedQuestion.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.status(200).json({ message: 'Question removed successfully' });
  } catch (error) {
    console.error('Error deleting saved question:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// ============================================================
// AI Tutor Chatbot — Context-aware per-lesson assistant
// ============================================================

const generateMockTutorReply = (message, lessonTitle, lessonContent, learningStyle) => {
  const msgLower = (message || '').toLowerCase();
  const style = (learningStyle || 'Visual').toLowerCase();

  // Style-specific formatting tips
  const styleHints = {
    visual: '📊 *As a visual learner, try drawing a diagram or flowchart to map this concept!*',
    logical: '🧮 *As a logical thinker, try breaking this into step-by-step rules or pseudocode.*',
    kinesthetic: '🛠️ *As a hands-on learner, try building a small project that uses this concept!*',
    auditory: '🎧 *As an auditory learner, try explaining this concept aloud to someone else!*'
  };
  const tip = styleHints[style] || styleHints.visual;

  // Pattern: practice problem request
  if (msgLower.includes('practice') || msgLower.includes('problem') || msgLower.includes('exercise') || msgLower.includes('quiz me')) {
    return {
      reply: `### 🎯 Practice Problem: ${lessonTitle}\n\n**Challenge:** Based on what you learned about ${lessonTitle.toLowerCase()}, try this:\n\n> Write a small code snippet or explain in your own words the core concept covered in this lesson. Then compare your answer to the lesson content.\n\n**Hint:** Focus on the key terms from the lesson material. The goal is to reinforce your memory through active recall.\n\n${tip}\n\n*Would you like me to give you a harder challenge or explain a specific part?*`,
      suggestions: ['Give me a harder challenge', 'Explain the key concepts', 'What are common mistakes?']
    };
  }

  // Pattern: explain simply
  if (msgLower.includes('explain') || msgLower.includes('simple') || msgLower.includes('eli5') || msgLower.includes('what is') || msgLower.includes('what are')) {
    const contentPreview = lessonContent ? lessonContent.substring(0, 200) : 'this topic';
    return {
      reply: `### 💡 Simple Explanation: ${lessonTitle}\n\nHere's the core idea in plain language:\n\n${contentPreview}...\n\n**Think of it this way:** Imagine you're building with LEGO blocks. Each concept in this lesson is like a different type of block — they each serve a purpose, and when combined correctly, they create something powerful.\n\n${tip}\n\n*Want me to go deeper into any specific part?*`,
      suggestions: ['Go deeper into this', 'Give me an analogy', 'How does this connect to the next lesson?']
    };
  }

  // Pattern: key takeaways
  if (msgLower.includes('takeaway') || msgLower.includes('summary') || msgLower.includes('key point') || msgLower.includes('important')) {
    return {
      reply: `### 📝 Key Takeaways: ${lessonTitle}\n\n1. **Core Concept**: The main idea of this lesson centers around understanding ${lessonTitle.toLowerCase()} and how it fits into the bigger picture.\n2. **Practical Application**: You should be able to apply these concepts in real projects after this lesson.\n3. **Foundation Building**: This topic connects directly to what comes next in the course — mastering it now will make future lessons much smoother.\n\n${tip}\n\n*Would you like me to quiz you on these takeaways?*`,
      suggestions: ['Quiz me on this', 'How does this connect to the next lesson?', 'Give me a practice problem']
    };
  }

  // Pattern: mistakes / pitfalls
  if (msgLower.includes('mistake') || msgLower.includes('wrong') || msgLower.includes('pitfall') || msgLower.includes('common error')) {
    return {
      reply: `### ⚠️ Common Mistakes: ${lessonTitle}\n\nHere are pitfalls beginners often run into:\n\n1. **Misunderstanding scope** — Make sure you understand where and when this concept applies.\n2. **Overcomplicating it** — Start simple. The lesson content gives you the foundation; don't jump ahead.\n3. **Skipping practice** — Reading is not enough! Active recall and coding practice make the difference.\n\n${tip}\n\n*Want me to walk through a specific example?*`,
      suggestions: ['Walk me through an example', 'Explain this simply', 'Give me a practice problem']
    };
  }

  // Default: general helpful response
  return {
    reply: `### 🤖 AI Tutor — ${lessonTitle}\n\nGreat question! Based on the current lesson **"${lessonTitle}"**, here's what I can tell you:\n\nThe lesson covers fundamental concepts that are essential for your learning path. ${lessonContent ? `Specifically, the material mentions: *"${lessonContent.substring(0, 150)}..."*` : ''}\n\nI can help you understand this better! Try asking me to:\n- Explain a specific concept simply\n- Generate a practice problem\n- Summarize the key takeaways\n- Identify common mistakes to avoid\n\n${tip}`,
    suggestions: ['Explain this simply', 'Give me a practice problem', 'What are the key takeaways?']
  };
};


export const tutorChat = async (req, res) => {
  const { message, lessonTitle, lessonContent, learningStyle, conversationHistory } = req.body;
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    // Smart mock fallback
    const mockResult = generateMockTutorReply(message, lessonTitle, lessonContent, learningStyle);
    return res.status(200).json(mockResult);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `You are an expert, encouraging AI tutor embedded in an online learning platform called SkillSwap. You are assisting a student who is currently studying the lesson titled "${lessonTitle}".

LESSON CONTENT:
"""
${lessonContent || 'No lesson content provided.'}
"""

STUDENT LEARNING STYLE: ${learningStyle || 'Visual'}

YOUR INSTRUCTIONS:
- Answer questions specifically related to the lesson content above.
- Be encouraging, warm, and supportive. Use emojis sparingly for friendliness.
- Format responses with markdown: use headings (###), bold, bullet points, and code blocks where appropriate.
- If the student asks for practice problems, generate relevant ones based on the lesson.
- If the student asks you to explain something simply, use analogies and plain language.
- Adapt your explanations to the student's learning style (Visual = diagrams/charts, Logical = step-by-step/code, Kinesthetic = hands-on exercises, Auditory = analogies/stories).
- Keep responses concise but thorough (150-300 words).
- At the end, suggest 2-3 follow-up questions the student might want to ask.`;

    // Build conversation for context
    const chatHistory = (conversationHistory || []).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: `I'm your AI Tutor for "${lessonTitle}". I've reviewed the lesson material and I'm ready to help! What would you like to know?` }] },
        ...chatHistory
      ]
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const replyText = response.text();

    return res.status(200).json({
      reply: replyText,
      suggestions: ['Explain this differently', 'Give me a practice problem', 'What should I learn next?']
    });
  } catch (error) {
    console.error("Gemini API Error in AI Tutor:", error);
    // Fallback on API error
    const mockResult = generateMockTutorReply(message, lessonTitle, lessonContent, learningStyle);
    return res.status(200).json(mockResult);
  }
};


