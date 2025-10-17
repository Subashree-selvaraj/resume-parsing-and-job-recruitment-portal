import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaBriefcase, FaUsers, FaChartLine, FaRocket, FaLock } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

// Header Component
const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="bg-transparent absolute top-4 left-0 right-0 z-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link to="/" className="text-white font-bold text-xl">JobPortal</Link>
        <nav className="flex items-center gap-4">
          <Link to="/" className="text-white hover:underline">Home</Link>
          <Link to="/jobs" className="text-white hover:underline">Jobs</Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-white hover:underline">Dashboard</Link>
              <button onClick={logout} className="text-white bg-white/10 px-3 py-1 rounded">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white">Sign In</Link>
              <Link to="/register" className="text-white bg-white/20 px-3 py-1 rounded">Sign Up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

// Hero Section Component
const HeroSection = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { isAuthenticated, user, logout } = useAuth();
  
  const heroSlides = [
    {
      title: "Find Your Dream Job Today",
      subtitle: "Connect with top employers and discover opportunities that match your skills and aspirations.",
      cta: "Start Job Search",
      action: () => navigate('/register?role=job_seeker'),
      background: "from-blue-600 to-purple-700"
    },
    {
      title: "Hire Top Talent Efficiently", 
      subtitle: "Our ATS system helps you find, evaluate, and hire the best candidates faster than ever.",
      cta: "Post a Job",
      action: () => navigate('/register?role=recruiter'),
      background: "from-green-600 to-blue-600"
    },
    {
      title: "AI-Powered Resume Matching",
      subtitle: "Advanced algorithms ensure perfect job-candidate matches based on skills and experience.",
      cta: "Learn More",
      action: () => document.getElementById('features').scrollIntoView({ behavior: 'smooth' }),
      background: "from-purple-600 to-pink-600"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-10"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0.1, 0.5, 0.1],
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            <motion.h1
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
            >
              {heroSlides[currentSlide].title}
            </motion.h1>
            
            <motion.p
              key={`subtitle-${currentSlide}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl mb-8 text-gray-200 leading-relaxed"
            >
              {heroSlides[currentSlide].subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={heroSlides[currentSlide].action}
                className="px-8 py-4 bg-white text-purple-600 rounded-lg font-semibold text-lg shadow-xl hover:bg-gray-100 transition-colors duration-200"
              >
                {heroSlides[currentSlide].cta}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-purple-600 transition-all duration-200"
              >
                Sign In
              </motion.button>
            </motion.div>

            {/* Slide Indicators */}
            <div className="flex space-x-2 mt-8">
              {heroSlides.map((_, index) => (
                <motion.button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                    index === currentSlide ? 'bg-white' : 'bg-white/30'
                  }`}
                  onClick={() => setCurrentSlide(index)}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </div>
          </motion.div>

          {/* Hero Animation */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
              <div className="space-y-6">
                
                {/* Search Animation */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="bg-white rounded-xl p-6 shadow-xl"
                >
                  <div className="flex items-center space-x-4">
                    <FaSearch className="text-indigo-600 text-2xl" />
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded-full w-2/3"></div>
                    </div>
                  </div>
                </motion.div>

                {/* Job Cards Animation */}
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      x: [0, 5, 0],
                      scale: [1, 1.02, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut",
                    }}
                    className="bg-white rounded-xl p-4 shadow-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-2 bg-gray-200 rounded-full mb-2"></div>
                        <div className="h-2 bg-gray-200 rounded-full w-3/4"></div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-20"
            />
            <motion.div
              animate={{
                rotate: [360, 0],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-20"
            />
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white"
      >
        <div className="flex flex-col items-center space-y-2">
          <span className="text-sm">Scroll Down</span>
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView({ threshold: 0.3 });

  useEffect(() => {
    if (inView) {
      let startTime = null;
      const startCount = 0;
      
      const animate = (currentTime) => {
        if (startTime === null) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        
        setCount(Math.floor(progress * (end - startCount) + startCount));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [inView, end, duration]);

  return (
    <span ref={ref} className="text-4xl md:text-5xl font-bold text-indigo-600">
      {count.toLocaleString()}{suffix}
    </span>
  );
};

// Stats Section Component
const StatsSection = () => {
  const stats = [
    { number: 50000, suffix: '+', label: 'Jobs Posted' },
    { number: 25000, suffix: '+', label: 'Companies' },
    { number: 1000000, suffix: '+', label: 'Job Seekers' },
    { number: 95, suffix: '%', label: 'Success Rate' },
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-xl text-gray-600">
            Join the community that's transforming careers worldwide
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="mb-2">
                <AnimatedCounter end={stat.number} suffix={stat.suffix} />
              </div>
              <p className="text-gray-600 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Features Section Component
const FeaturesSection = () => {
  const features = [
    {
      icon: FaSearch,
      title: 'Smart Job Matching',
      description: 'AI-powered algorithm matches candidates with perfect job opportunities based on skills and preferences.',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      icon: FaBriefcase,
      title: 'Complete ATS Solution',
      description: 'Full applicant tracking system with automated screening, interview scheduling, and candidate management.',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: FaUsers,
      title: 'Resume Parsing',
      description: 'Automatic resume parsing and data extraction to streamline the application process for both parties.',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: FaChartLine,
      title: 'Analytics & Insights',
      description: 'Comprehensive analytics dashboard with hiring metrics, candidate insights, and performance tracking.',
      color: 'from-orange-500 to-red-600'
    },
    {
      icon: FaRocket,
      title: 'Fast Hiring Process',
      description: 'Streamlined workflow reduces time-to-hire by 60% with automated processes and smart recommendations.',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      icon: FaLock,
      title: 'Secure & Compliant',
      description: 'Enterprise-grade security with GDPR compliance and data protection for candidate information.',
      color: 'from-indigo-500 to-purple-600'
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for Modern Hiring
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to find, evaluate, and hire the best talent in one integrated platform
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
            >
              <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors duration-300">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA Section Component
const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-700 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Hiring Process?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of companies and job seekers who have found success with our platform
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold text-lg shadow-xl hover:bg-gray-50 transition-colors duration-200"
            >
              <Link to="/register?role=recruiter">Start Hiring Now</Link>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-indigo-600 transition-all duration-200"
            >
              <Link to="/register?role=job_seeker">Find Your Dream Job</Link>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Main Landing Page Component
const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <CTASection />
    </div>
  );
};

export default LandingPage;