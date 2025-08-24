import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Brain, 
  BarChart, 
  Users, 
  ChevronRight, 
  Star,
  Calendar,
  Zap,
  Lightbulb,
  Award,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HomePageProps {
  onSignupClick: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onSignupClick }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')] bg-cover bg-center"></div>
        </div>
        <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl">
            <h5 className="text-blue-200 font-medium mb-3 animate-fadeIn">AI-Powered Learning Platform</h5>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight animate-slideFromBottom">
              Learn Smarter, <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-teal-300">
                Teach Better
              </span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 animate-slideFromBottom" style={{ animationDelay: '100ms' }}>
              SkillSwap personalizes education through AI and cognitive profiling, 
              connecting you with peers who complement your learning style.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-slideFromBottom" style={{ animationDelay: '200ms' }}>
              <button 
                onClick={onSignupClick}
                className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 flex items-center justify-center"
              >
                Join Now
                <ChevronRight className="ml-1 w-5 h-5" />
              </button>
              {isAuthenticated ? (
                <Link 
                  to="/dashboard" 
                  className="px-6 py-3 border border-white bg-transparent text-white font-medium rounded-lg hover:bg-white/10 transition flex items-center justify-center"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <button 
                  className="px-6 py-3 border border-white bg-transparent text-white font-medium rounded-lg hover:bg-white/10 transition flex items-center justify-center"
                >
                  Learn More
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Curved bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-white rounded-t-[50%] transform translate-y-6"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Redefining How We Learn and Teach
            </h2>
            <p className="text-lg text-gray-600">
              Our platform combines AI technology with cognitive science to deliver 
              a personalized learning experience that adapts to your unique needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition p-6 group">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI Question Generator</h3>
              <p className="text-gray-600 mb-4">
                Generate personalized questions and quizzes tailored to your learning style and cognitive strengths.
              </p>
              <Link to="/question-generator" className="text-blue-600 font-medium flex items-center hover:text-blue-800 transition">
                Try it out
                <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition p-6 group">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Peer Matching</h3>
              <p className="text-gray-600 mb-4">
                Connect with peers who complement your learning style and can help you grow in your areas of interest.
              </p>
              <Link to="/peer-matching" className="text-green-600 font-medium flex items-center hover:text-green-800 transition">
                Find peers
                <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition p-6 group">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition">
                <BarChart className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Gamified Learning</h3>
              <p className="text-gray-600 mb-4">
                Earn XP, badges, and track your progress with leaderboards to stay motivated and engaged.
              </p>
              <Link to="/dashboard" className="text-purple-600 font-medium flex items-center hover:text-purple-800 transition">
                View progress
                <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How SkillSwap Works
            </h2>
            <p className="text-lg text-gray-600">
              Our simple yet powerful process helps you learn efficiently and connect with the right peers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center mb-6 relative">
                <Lightbulb className="w-8 h-8" />
                <div className="absolute -right-1 -top-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Take the Quiz</h3>
              <p className="text-gray-600">
                Complete our cognitive profile quiz to identify your learning style and strengths.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center mb-6 relative">
                <Brain className="w-8 h-8" />
                <div className="absolute -right-1 -top-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Get AI Recommendations</h3>
              <p className="text-gray-600">
                Receive personalized content and learning materials based on your profile.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center mb-6 relative">
                <Users className="w-8 h-8" />
                <div className="absolute -right-1 -top-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Connect with Peers</h3>
              <p className="text-gray-600">
                Find and connect with peers who match your learning needs and goals.
              </p>
            </div>
            
            {/* Step 4 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center mb-6 relative">
                <Zap className="w-8 h-8" />
                <div className="absolute -right-1 -top-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                  <span className="text-blue-600 font-bold">4</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Learn & Grow</h3>
              <p className="text-gray-600">
                Track your progress, earn rewards, and continuously improve your skills.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-gray-600">
              Thousands of learners and teachers have transformed their educational journey with SkillSwap.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <img 
                    src="https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=150" 
                    alt="Sarah J." 
                    className="w-14 h-14 rounded-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Sarah Johnson</h4>
                  <p className="text-sm text-gray-600">Software Engineer</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 text-yellow-500 fill-current" />
                ))}
              </div>
              <p className="text-gray-700">
                "The AI question generator adapts perfectly to my visual learning style. 
                I've made more progress in Python in 2 weeks than in 3 months of traditional courses."
              </p>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <img 
                    src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=150" 
                    alt="David R." 
                    className="w-14 h-14 rounded-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">David Rodriguez</h4>
                  <p className="text-sm text-gray-600">Math Teacher</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 text-yellow-500 fill-current" />
                ))}
              </div>
              <p className="text-gray-700">
                "As a teacher, SkillSwap has revolutionized how I connect with students. 
                The peer matching helps me find students who benefit most from my teaching style."
              </p>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <img 
                    src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=150" 
                    alt="Aisha K." 
                    className="w-14 h-14 rounded-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Aisha Khan</h4>
                  <p className="text-sm text-gray-600">Biology Student</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 text-yellow-500 fill-current" />
                ))}
              </div>
              <p className="text-gray-700">
                "The gamification elements keep me motivated. I've maintained a 45-day streak 
                and the badges actually mean something to me. Learning has never been this fun!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Learning Experience?
            </h2>
            <p className="text-lg text-blue-100 mb-8">
              Join thousands of learners who have discovered their optimal learning style 
              and connected with the perfect peers to accelerate their education.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button 
                onClick={onSignupClick}
                className="px-8 py-4 bg-white text-blue-600 font-medium rounded-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
              >
                Get Started For Free
              </button>
              <a 
                href="#"
                className="px-8 py-4 border border-white bg-transparent text-white font-medium rounded-lg hover:bg-white/10 transition"
              >
                Schedule a Demo
              </a>
            </div>
            <p className="text-blue-200 mt-6 text-sm">
              No credit card required. Free plan available with basic features.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;