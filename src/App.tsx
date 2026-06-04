import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import QuestionGenerator from './pages/QuestionGenerator';
import PeerMatching from './pages/PeerMatching';
import ProfilePage from './pages/ProfilePage';
import Messages from './pages/Messages';
import LMSCourses from './pages/LMSCourses';
import LMSCourseViewer from './pages/LMSCourseViewer';
import LMSCourseBuilder from './pages/LMSCourseBuilder';
import AcademyManager from './pages/AcademyManager';
import StudyCircles from './pages/StudyCircles';
import Analytics from './pages/Analytics';
import { AuthProvider } from './context/AuthContext';
import AuthModal from './components/auth/AuthModal';

import { Toaster } from 'sonner';

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const openLoginModal = () => {
    setAuthMode('login');
    setIsAuthModalOpen(true);
  };

  const openSignupModal = () => {
    setAuthMode('signup');
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Header onLoginClick={openLoginModal} onSignupClick={openSignupModal} />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage onSignupClick={openSignupModal} />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/courses" element={<LMSCourses />} />
              <Route path="/course-viewer/:courseId" element={<LMSCourseViewer />} />
              <Route path="/course-builder" element={<LMSCourseBuilder />} />
              <Route path="/academy-manager" element={<AcademyManager />} />
              <Route path="/question-generator" element={<QuestionGenerator />} />
              <Route path="/peer-matching" element={<PeerMatching />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/study-circles" element={<StudyCircles />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </main>

          <Footer />
          <AuthModal 
            isOpen={isAuthModalOpen} 
            onClose={closeAuthModal} 
            initialMode={authMode} 
          />
          <Toaster position="bottom-right" richColors />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;