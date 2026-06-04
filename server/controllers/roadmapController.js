import { GoogleGenerativeAI } from '@google/generative-ai';
import Roadmap from '../models/Roadmap.js';
import User from '../models/User.js';
import { isDbConnected } from '../index.js';
import { mockRoadmaps } from '../mockDb.js';
import { processUserXp } from './gamificationController.js';

const generateMockRoadmap = (topic, learningStyle) => {
  const topicNormalized = topic.trim();
  const styleKey = learningStyle.toLowerCase();
  
  const resourcesList = {
    visual: [
      `Read visual guides & flowcharts on ${topicNormalized}`,
      `Watch video diagrams and graphical tutorials for ${topicNormalized} on YouTube`,
      `Draw a memory map or visual node structure of the ${topicNormalized} flow`
    ],
    logical: [
      `Analyze execution traces and debug stack-overflow cases on ${topicNormalized}`,
      `Review step-by-step documentation on ${topicNormalized} architecture`,
      `Write a logical proof-of-concept showing input-output logic of ${topicNormalized}`
    ],
    auditory: [
      `Listen to podcasts or conference talks explaining ${topicNormalized}`,
      `Explain ${topicNormalized} out loud to a peer or recording device`,
      `Participate in discord discussions or audio calls regarding ${topicNormalized}`
    ],
    kinesthetic: [
      `Build a raw playground project focusing purely on ${topicNormalized}`,
      `Write code snippets, compile them, and resolve compiler errors`,
      `Follow an interactive tutorial sandbox or write test assertions`
    ]
  };

  const selectedResources = resourcesList[styleKey] || resourcesList.visual;

  return [
    {
      id: 1,
      title: `Phase 1: Fundamentals of ${topicNormalized}`,
      description: styleKey === 'visual'
        ? `Study visual block diagrams and overview maps illustrating the core pillars of ${topicNormalized}.`
        : styleKey === 'logical'
        ? `Deconstruct the step-by-step execution rules and constraints governing ${topicNormalized}.`
        : styleKey === 'auditory'
        ? `Listen to overview walkthrough lectures introducing the key terminology of ${topicNormalized}.`
        : `Run a basic local setup environment to execute a 'Hello World' file for ${topicNormalized}.`,
      duration: '1.5 hours',
      milestone: styleKey === 'kinesthetic' ? 'Run your first code script successfully.' : 'Explain the fundamental definitions.',
      resources: [selectedResources[0], 'MDN / Official Documentation guides'],
      completed: false
    },
    {
      id: 2,
      title: `Phase 2: Core Architecture & Syntax`,
      description: styleKey === 'visual'
        ? `Analyze flowcharts showing how data circulates through ${topicNormalized} components.`
        : styleKey === 'logical'
        ? `Examine how variables, structures, and classes interact in ${topicNormalized}.`
        : styleKey === 'auditory'
        ? `Discuss execution flows and ask questions about core components in peer channels.`
        : `Build three simple micro-modules implementing core syntax components.`,
      duration: '2.5 hours',
      milestone: 'Map out the core variables and structures.',
      resources: [selectedResources[1], 'Community forums'],
      completed: false
    },
    {
      id: 3,
      title: `Phase 3: Intermediate Features & Design Patterns`,
      description: styleKey === 'visual'
        ? `Draw schematic representations of custom design patterns for ${topicNormalized}.`
        : styleKey === 'logical'
        ? `Compare optimization levels and execution efficiency for multiple design patterns.`
        : styleKey === 'auditory'
        ? `Review verbal case-studies outlining popular industry approaches.`
        : `Refactor existing code into modular classes and run comprehensive tests.`,
      duration: '3 hours',
      milestone: 'Optimize design logic to reduce complexity.',
      resources: ['Advanced Guides', selectedResources[2]],
      completed: false
    },
    {
      id: 4,
      title: `Phase 4: Troubleshooting & Debugging`,
      description: styleKey === 'visual'
        ? `Trace call stacks visually using browser DevTools or profiling timelines.`
        : styleKey === 'logical'
        ? `Write unit tests to assert correct execution flows and isolate failing test cases.`
        : styleKey === 'auditory'
        ? `Debate bug fixes in a group or review audio debug guides.`
        : `Write shell scripts or custom functions to hot-reload and trace errors.`,
      duration: '2 hours',
      milestone: 'Fix 3 common error issues in a sandbox environment.',
      resources: ['Troubleshooting manual', selectedResources[0]],
      completed: false
    },
    {
      id: 5,
      title: `Phase 5: Capstone Practical Implementation`,
      description: styleKey === 'visual'
        ? `Design the interface and storyboard a fully functioning application.`
        : styleKey === 'logical'
        ? `Formulate the logic matrices and database relationships for the capstone.`
        : styleKey === 'auditory'
        ? `Conduct a verbal peer code review explaining your architectural choices.`
        : `Code, build, and deploy a complete production-ready capstone app.`,
      duration: '4 hours',
      milestone: 'Final deployment and code check-off.',
      resources: ['Project specifications list', selectedResources[2]],
      completed: false
    }
  ];
};

export const generateRoadmap = async (req, res) => {
  const { topic, learningStyle } = req.body;
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    const steps = generateMockRoadmap(topic, learningStyle);
    return res.status(200).json({ topic, learningStyle, steps });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an educational AI designed to formulate a learning roadmap. Create a 5-step learning roadmap for topic: "${topic}".
The roadmap must be tailored for a ${learningStyle} learner:
- Visual: emphasize diagrams, graphical charts, flow maps, spatial layouts.
- Logical: emphasize reasoning flow, puzzles, algorithm structures, architectural details.
- Auditory: emphasize verbal summaries, discussion prompts, vocal peer exercises.
- Kinesthetic: emphasize hands-on labs, coding exercises, debugging, compiling.

Output strictly as a JSON array of objects. Do not include markdown codeblocks.
Each object must have the following keys:
- 'id': numeric ID (1 to 5)
- 'title': short title of the milestone
- 'description': detailed study directions tailored to ${learningStyle} style
- 'duration': estimate time needed (e.g. '2 hours')
- 'milestone': a specific practical checkpoint action to check off
- 'resources': array of 2-3 specific learning resources or links (mock urls or descriptive titles)
- 'completed': always set to false initially.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();

    const steps = JSON.parse(text);
    return res.status(200).json({ topic, learningStyle, steps });
  } catch (error) {
    console.error("Gemini API Roadmap Error:", error);
    const steps = generateMockRoadmap(topic, learningStyle);
    return res.status(200).json({ topic, learningStyle, steps });
  }
};

export const saveRoadmap = async (req, res) => {
  const { userId, topic, learningStyle, steps } = req.body;

  if (!isDbConnected()) {
    const newRoadmap = {
      _id: Math.random().toString(36).substring(2, 9),
      userId,
      topic,
      learningStyle,
      steps,
      createdAt: new Date()
    };
    mockRoadmaps.push(newRoadmap);
    return res.status(201).json({ message: 'Roadmap saved successfully (Mock Mode)', roadmap: newRoadmap });
  }

  try {
    const roadmap = await Roadmap.create({
      userId,
      topic,
      learningStyle,
      steps
    });
    res.status(201).json({ message: 'Roadmap saved successfully', roadmap });
  } catch (error) {
    console.error('Error saving roadmap:', error);
    res.status(500).json({ message: 'Server error saving roadmap' });
  }
};

export const getRoadmaps = async (req, res) => {
  const { userId } = req.params;

  if (!isDbConnected()) {
    const userRoadmaps = mockRoadmaps.filter(r => r.userId === userId);
    return res.status(200).json({ roadmaps: userRoadmaps });
  }

  try {
    const roadmaps = await Roadmap.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ roadmaps });
  } catch (error) {
    console.error('Error retrieving roadmaps:', error);
    res.status(500).json({ message: 'Server error retrieving roadmaps' });
  }
};

export const toggleStepCompletion = async (req, res) => {
  const { roadmapId, stepId } = req.params;
  const { completed } = req.body;

  if (!isDbConnected()) {
    const roadmap = mockRoadmaps.find(r => r._id === roadmapId);
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }
    const step = roadmap.steps.find(s => s.id === Number(stepId));
    if (!step) {
      return res.status(404).json({ message: 'Step not found' });
    }
    
    const wasCompleted = step.completed;
    step.completed = completed;
    
    let xpAwarded = 0;
    let user = null;
    
    if (completed && !wasCompleted) {
      xpAwarded += 20;
      const allCompleted = roadmap.steps.every(s => s.completed);
      if (allCompleted) {
        xpAwarded += 50;
      }
      user = await processUserXp(roadmap.userId, xpAwarded);
    }
    
    return res.status(200).json({ 
      message: 'Step status updated (Mock Mode)', 
      roadmap,
      xpAwarded,
      user
    });
  }

  try {
    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }
    const step = roadmap.steps.find(s => s.id === Number(stepId));
    if (!step) {
      return res.status(404).json({ message: 'Step not found' });
    }
    
    const wasCompleted = step.completed;
    step.completed = completed;
    await roadmap.save();
    
    let xpAwarded = 0;
    let user = null;
    
    if (completed && !wasCompleted) {
      xpAwarded += 20;
      const allCompleted = roadmap.steps.every(s => s.completed);
      if (allCompleted) {
        xpAwarded += 50;
      }
      user = await processUserXp(roadmap.userId, xpAwarded);
    }
    
    res.status(200).json({ 
      message: 'Step status updated', 
      roadmap,
      xpAwarded,
      user
    });
  } catch (error) {
    console.error('Error toggling step completion:', error);
    res.status(500).json({ message: 'Server error updating step' });
  }
};
