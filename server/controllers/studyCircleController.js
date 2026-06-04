import mongoose from 'mongoose';
import StudyCircle from '../models/StudyCircle.js';
import User from '../models/User.js';
import { mockStudyCircles, mockUsers } from '../mockDb.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const isDbConnected = () => mongoose.connection.readyState === 1;

export const matchCircle = async (req, res) => {
  const { userId, topic } = req.body;

  if (!userId || !topic) {
    return res.status(400).json({ message: 'User ID and topic are required' });
  }

  // 1. Get user details
  let currentUser;
  if (isDbConnected()) {
    currentUser = await User.findById(userId);
  } else {
    currentUser = mockUsers.get(userId);
  }

  if (!currentUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  const userStyle = currentUser.learningStyle || 'Visual';

  // 2. Select compatible peers
  let candidates = [];
  if (isDbConnected()) {
    try {
      const dbUsers = await User.find({ _id: { $ne: userId }, role: 'student' });
      candidates = dbUsers.map(u => ({
        id: u._id.toString(),
        name: u.name,
        learningStyle: u.learningStyle || 'Visual',
        email: u.email
      }));
    } catch (err) {
      console.error("Failed to query DB users:", err);
    }
  }

  // Add mock peers from mockDb
  const allMockPeers = [
    { id: 'mock-david', name: 'David Chen', learningStyle: 'Logical' },
    { id: 'mock-sofia', name: 'Sofia Martinez', learningStyle: 'Kinesthetic' },
    { id: 'mock-sarah', name: 'Sarah Johnson', learningStyle: 'Visual' },
    { id: 'mock-alex', name: 'Alex Garcia', learningStyle: 'Auditory' }
  ];

  // Filter out any candidates that are the current user
  candidates = candidates.filter(c => c.id !== userId);

  // Add mock peers if candidates list is too small
  for (const mockPeer of allMockPeers) {
    if (mockPeer.id !== userId && !candidates.some(c => c.id === mockPeer.id)) {
      candidates.push(mockPeer);
    }
  }

  // Sort candidates: prioritize styles different from userStyle (cognitive diversity)
  const stylePriority = ['Visual', 'Logical', 'Kinesthetic', 'Auditory'];
  
  candidates.sort((a, b) => {
    const scoreA = a.learningStyle === userStyle ? 1 : 0;
    const scoreB = b.learningStyle === userStyle ? 1 : 0;
    return scoreA - scoreB;
  });

  // Take the top 2 peers to make a 3-member circle
  const selectedPeers = candidates.slice(0, 2);
  const memberIds = [userId, ...selectedPeers.map(p => p.id)];

  // Generate team name
  const suffixes = ["Gladiators", "Titans", "Wizards", "Ninjas", "Guild", "Pioneers", "Architects"];
  const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  const shortTopic = topic.split(' ')[0] || "Study";
  const circleName = `${shortTopic} ${randomSuffix}`;

  // Generate default milestones
  const milestones = [];
  const lowercaseTopic = topic.toLowerCase();
  if (lowercaseTopic.includes('react') || lowercaseTopic.includes('hook') || lowercaseTopic.includes('state') || lowercaseTopic.includes('development')) {
    milestones.push(
      { id: 'm1', title: 'Build React component hierarchy diagram', completedBy: [] },
      { id: 'm2', title: 'Complete Module 2 quiz on hooks', completedBy: [] },
      { id: 'm3', title: 'Integrate custom useLocalStorage hook', completedBy: [] },
      { id: 'm4', title: 'Deploy prototype sandbox to server', completedBy: [] }
    );
  } else if (lowercaseTopic.includes('python') || lowercaseTopic.includes('algorithm') || lowercaseTopic.includes('structure')) {
    milestones.push(
      { id: 'm1', title: 'Draw time-complexity big-O cheat sheet', completedBy: [] },
      { id: 'm2', title: 'Solve a binary tree traversal puzzle', completedBy: [] },
      { id: 'm3', title: 'Write list comprehension optimization tests', completedBy: [] },
      { id: 'm4', title: 'Present recursion flowchart in group chat', completedBy: [] }
    );
  } else {
    milestones.push(
      { id: 'm1', title: 'Create initial sketch of concept structure', completedBy: [] },
      { id: 'm2', title: 'Discuss core definitions in chat session', completedBy: [] },
      { id: 'm3', title: 'Build a working prototype in sandbox', completedBy: [] },
      { id: 'm4', title: 'Present final solutions to the cohort', completedBy: [] }
    );
  }

  const chatRoomId = 'circle-' + Math.random().toString(36).substring(2, 9);

  let circle;
  if (!isDbConnected()) {
    circle = {
      id: chatRoomId,
      _id: chatRoomId,
      name: circleName,
      topic: topic,
      members: memberIds,
      milestones: milestones,
      chatRoomId: chatRoomId,
      createdAt: new Date()
    };
    mockStudyCircles.push(circle);
  } else {
    try {
      const dbCircle = new StudyCircle({
        name: circleName,
        topic: topic,
        members: memberIds,
        milestones: milestones,
        chatRoomId: chatRoomId
      });
      await dbCircle.save();
      circle = dbCircle.toObject();
    } catch (err) {
      console.error("Failed to save StudyCircle in DB:", err);
      return res.status(500).json({ message: 'Database error creating circle' });
    }
  }

  // Populate details for response
  const memberDetails = [];
  for (const mid of memberIds) {
    if (isDbConnected()) {
      const u = await User.findById(mid);
      if (u) {
        memberDetails.push({ id: u._id.toString(), name: u.name, learningStyle: u.learningStyle });
        continue;
      }
    }
    const mu = mockUsers.get(mid);
    if (mu) {
      memberDetails.push({ id: mu.id, name: mu.name, learningStyle: mu.learningStyle });
    } else {
      memberDetails.push({ id: mid, name: 'Unknown Student', learningStyle: 'Visual' });
    }
  }

  res.status(201).json({
    message: 'Study Circle matched successfully!',
    circle: { ...circle, memberDetails }
  });
};

export const getUserCircles = async (req, res) => {
  const { userId } = req.params;

  if (!isDbConnected()) {
    const circles = mockStudyCircles.filter(c => c.members.includes(userId));
    const circlesWithMemberDetails = circles.map(c => {
      const memberDetails = c.members.map(mid => {
        const u = mockUsers.get(mid);
        return u ? { id: u.id, name: u.name, learningStyle: u.learningStyle } : { id: mid, name: 'Unknown Student', learningStyle: 'Visual' };
      });
      return { ...c, memberDetails };
    });
    return res.status(200).json({ circles: circlesWithMemberDetails });
  }

  try {
    const circles = await StudyCircle.find({ members: userId }).sort({ createdAt: -1 });
    const populatedCircles = [];
    for (const c of circles) {
      const memberDetails = [];
      for (const mid of c.members) {
        const u = await User.findById(mid);
        if (u) {
          memberDetails.push({ id: u._id.toString(), name: u.name, learningStyle: u.learningStyle });
        } else {
          const mu = mockUsers.get(mid);
          if (mu) {
            memberDetails.push({ id: mu.id, name: mu.name, learningStyle: mu.learningStyle });
          } else {
            memberDetails.push({ id: mid, name: 'Unknown Student', learningStyle: 'Visual' });
          }
        }
      }
      populatedCircles.push({
        ...c.toObject(),
        memberDetails
      });
    }
    res.status(200).json({ circles: populatedCircles });
  } catch (error) {
    console.error("Error fetching user circles:", error);
    res.status(500).json({ message: 'Server error fetching study circles' });
  }
};

export const toggleMilestone = async (req, res) => {
  const { circleId, milestoneId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  if (!isDbConnected()) {
    const circle = mockStudyCircles.find(c => c.id === circleId || c._id === circleId);
    if (!circle) {
      return res.status(404).json({ message: 'Study Circle not found' });
    }
    const milestone = circle.milestones.find(m => m.id === milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    if (milestone.completedBy.includes(userId)) {
      milestone.completedBy = milestone.completedBy.filter(id => id !== userId);
    } else {
      milestone.completedBy.push(userId);
    }

    const memberDetails = circle.members.map(mid => {
      const u = mockUsers.get(mid);
      return u ? { id: u.id, name: u.name, learningStyle: u.learningStyle } : { id: mid, name: 'Unknown Student', learningStyle: 'Visual' };
    });

    return res.status(200).json({ 
      message: 'Milestone toggled successfully', 
      circle: { ...circle, memberDetails } 
    });
  }

  try {
    const circle = await StudyCircle.findById(circleId);
    if (!circle) {
      return res.status(404).json({ message: 'Study Circle not found' });
    }
    const milestone = circle.milestones.find(m => m.id === milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    const index = milestone.completedBy.indexOf(userId);
    if (index > -1) {
      milestone.completedBy.splice(index, 1);
    } else {
      milestone.completedBy.push(userId);
    }

    await circle.save();
    
    const memberDetails = [];
    for (const mid of circle.members) {
      const u = await User.findById(mid);
      if (u) {
        memberDetails.push({ id: u._id.toString(), name: u.name, learningStyle: u.learningStyle });
      } else {
        const mu = mockUsers.get(mid);
        if (mu) {
          memberDetails.push({ id: mu.id, name: mu.name, learningStyle: mu.learningStyle });
        } else {
          memberDetails.push({ id: mid, name: 'Unknown Student', learningStyle: 'Visual' });
        }
      }
    }

    res.status(200).json({ 
      message: 'Milestone toggled successfully', 
      circle: { ...circle.toObject(), memberDetails } 
    });
  } catch (error) {
    console.error("Error toggling milestone:", error);
    res.status(500).json({ message: 'Server error toggling milestone' });
  }
};

export const askCircleMentor = async (req, res) => {
  const { circleId } = req.params;
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ message: 'Question is required' });
  }

  let circle;
  if (!isDbConnected()) {
    circle = mockStudyCircles.find(c => c.id === circleId || c._id === circleId);
  } else {
    circle = await StudyCircle.findById(circleId);
  }

  if (!circle) {
    return res.status(404).json({ message: 'Study Circle not found' });
  }

  // Get learning styles of all members
  const learningStyles = new Set();
  if (!isDbConnected()) {
    circle.members.forEach(mid => {
      const u = mockUsers.get(mid);
      if (u) learningStyles.add(u.learningStyle);
    });
  } else {
    for (const mid of circle.members) {
      const u = await User.findById(mid);
      if (u && u.learningStyle) {
        learningStyles.add(u.learningStyle);
      } else {
        const mu = mockUsers.get(mid);
        if (mu) learningStyles.add(mu.learningStyle);
      }
    }
  }

  const styles = Array.from(learningStyles);
  if (styles.length === 0) styles.push('Visual', 'Logical');

  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    let reply = `### 🤖 Study Circle Mentor Answer\n\nHere is an explanation for your question about **${circle.topic}**: *"${question}"*\n\n`;

    if (styles.includes('Logical')) {
      reply += `#### 🧠 Logical Breakdown (For Logical Learners)\n1. **Core Mechanism**: We evaluate dependencies or data flows sequentially.\n2. **Code Implementation**:\n\`\`\`javascript\n// Execution order demo\nfunction handleExecution() {\n  console.log("1. Initialize state");\n  // Execute core instruction\n  return true;\n}\n\`\`\`\n`;
    }

    if (styles.includes('Visual')) {
      reply += `#### 🎨 Visual Flow Diagram (For Visual Learners)\n\`\`\`\n[User Trigger] ──> [State Change] ──> [Component Re-renders]\n       ▲                                        │\n       └─────────── [Updates DOM] ──────────────┘\n\`\`\`\n`;
    }

    if (styles.includes('Kinesthetic')) {
      reply += `#### 🛠️ Hands-on Sandbox Exercise (For Kinesthetic Learners)\n- **Try it now**: Open your workspace, create a temporary file, and paste the code snippet above. Try changing the argument in \`console.log\` and see how the execution order prints out in the terminal or devtools console.\n`;
    }

    if (styles.includes('Auditory')) {
      reply += `#### 🗣️ Analogy & Mnemonic (For Auditory Learners)\n- **Analogy**: Think of state updates like a queue at a grocery store checkout: every time an item is scanned, the register displays a new subtotal immediately.\n- **Mnemonic**: *State triggers, Component renders!*\n`;
    }

    return res.status(200).json({ answer: reply });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a friendly, highly skilled AI Tutor/Mentor guiding a collaborative student Study Circle. 
Topic: "${circle.topic}".
Question asked by circle member: "${question}".

The members of this circle have the following cognitive learning styles: ${styles.join(', ')}.

Please provide a comprehensive answer that is structured to address each of these styles:
${styles.includes('Visual') ? '- Visual Style: Include simple ASCII text block diagrams or clear Markdown flowcharts to visualize the concepts/hierarchy.' : ''}
${styles.includes('Logical') ? '- Logical Style: Include a clear step-by-step breakdown, code snippets, or a sequential logic table.' : ''}
${styles.includes('Kinesthetic') ? '- Kinesthetic Style: Include a brief mock exercise prompt, sandbox challenge, or an experiment they can code up in 2 minutes.' : ''}
${styles.includes('Auditory') ? '- Auditory Style: Include a conversational analogy or a catchy mnemonic phrase that they could explain aloud to each other.' : ''}

Format the output beautifully and professionally using Markdown headings and bullets. Keep the overall length moderate, clear, and actionable.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text().trim();

    return res.status(200).json({ answer });
  } catch (error) {
    console.error("Gemini API Error in Study Circle Mentor:", error);
    return res.status(200).json({ 
      answer: `### 🤖 Study Circle Mentor Answer (API Error Fallback)\n\nAn error occurred while connecting to the Gemini API. Here is a quick summary for **${circle.topic}**:\n- **Question**: ${question}\n- **Recommendation**: Formulate your solution sequentially and review with your peers: ${styles.join(', ')}.`
    });
  }
};
