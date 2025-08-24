import React, { useState } from 'react';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import OnboardingQuiz from './OnboardingQuiz';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'onboarding'>(initialMode);
  const { isAuthenticated } = useAuth();

  // If user becomes authenticated while in login/signup mode, move to onboarding
  React.useEffect(() => {
    if (isAuthenticated && (mode === 'login' || mode === 'signup')) {
      setMode('onboarding');
    }
  }, [isAuthenticated, mode]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const switchToLogin = () => setMode('login');
  const switchToSignup = () => setMode('signup');

  const handleOnboardingComplete = () => {
    onClose();
    // Reset modal state for next opening
    setTimeout(() => setMode(initialMode), 300);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transition-all duration-300 transform"
        style={{
          opacity: isOpen ? 1 : 0,
          scale: isOpen ? 1 : 0.95,
        }}
      >
        <div className="relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {mode === 'login' ? 'Welcome Back!' : 
                 mode === 'signup' ? 'Join SkillSwap' : 
                 'Quick Assessment'}
              </h2>
              <p className="text-gray-600 mt-1">
                {mode === 'login' ? 'Sign in to your account' : 
                 mode === 'signup' ? 'Create your account to get started' : 
                 'Help us personalize your experience'}
              </p>
            </div>

            {mode === 'login' && (
              <>
                <LoginForm onCloseModal={onClose} />
                <p className="text-center mt-4 text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button 
                    onClick={switchToSignup}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Sign up
                  </button>
                </p>
              </>
            )}

            {mode === 'signup' && (
              <>
                <SignupForm />
                <p className="text-center mt-4 text-sm text-gray-600">
                  Already have an account?{' '}
                  <button 
                    onClick={switchToLogin}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Log in
                  </button>
                </p>
              </>
            )}

            {mode === 'onboarding' && (
              <OnboardingQuiz onComplete={handleOnboardingComplete} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;