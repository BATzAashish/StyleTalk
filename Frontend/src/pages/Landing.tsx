import { Button } from "@/components/ui/button";
import { Sparkles, MessageSquare, Zap, Globe, Puzzle, Chrome, Shield, Brain, Menu, X, CheckCircle2, Check, FileText, User, Clock, Calendar, Code } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { GridBackground } from "@/components/ui/glowing-card";
import DraggableTestimonials from "@/components/dashboard/DraggableTestimonials";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";
import { ShootingStars, StarsBackground } from "@/components/ui/shooting-stars";
import { useState, useId } from "react";

const featuresData = [
  {
    title: "Context-Aware AI",
    description:
      "Our AI detects emotion, intent, and relationship to suggest the perfect tone for every situation.",
  },
  {
    title: "Lightning Fast Responses",
    description:
      "Get AI-powered suggestions in under 3 seconds. Copy and paste, or export directly to your favorite messaging apps.",
  },
  {
    title: "Multiple Tone Styles",
    description:
      "Choose from Formal, Polite, Casual, Gen-Z, and Friends styles tailored for any conversation.",
  },
  {
    title: "Cultural Sensitivity",
    description:
      "Support for multiple languages with cultural awareness to communicate effectively with anyone, anywhere.",
  },
  {
    title: "Browser Plugin",
    description:
      "Seamlessly integrate StyleTalk into your browser for instant AI assistance across all your messaging platforms.",
  },
  {
    title: "Smart Translations",
    description:
      "Translate messages while maintaining tone and context, ensuring your meaning is preserved across languages.",
  },
  {
    title: "Privacy First",
    description:
      "Your conversations are secure with end-to-end encryption. We never store or share your personal messages.",
  },
  {
    title: "Conversation History",
    description:
      "Track your past suggestions and build a personal library of effective responses for future reference.",
  },
];

const timelineData = [
  {
    id: 1,
    title: "Paste Message",
    date: "Step 1",
    content: "Paste the message you received or want to reply to into StyleTalk.",
    category: "Input",
    icon: FileText,
    relatedIds: [2],
    status: "completed" as const,
    energy: 100,
  },
  {
    id: 2,
    title: "AI Analysis",
    date: "Step 2",
    content: "Our AI detects emotion, intent, and relationship automatically from your conversation context.",
    category: "Processing",
    icon: Brain,
    relatedIds: [1, 3],
    status: "completed" as const,
    energy: 90,
  },
  {
    id: 3,
    title: "Choose Style",
    date: "Step 3",
    content: "Get 5+ tone options: Formal, Polite, Casual, Gen-Z, and Friends styles for any situation.",
    category: "Selection",
    icon: Sparkles,
    relatedIds: [2, 4],
    status: "in-progress" as const,
    energy: 60,
  },
  {
    id: 4,
    title: "Copy & Send",
    date: "Step 4",
    content: "Copy your perfect response and send it with confidence across any platform.",
    category: "Output",
    icon: MessageSquare,
    relatedIds: [3],
    status: "pending" as const,
    energy: 30,
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-black">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center py-4">
            <Link 
              to="/"
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">StyleTalk</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-300 hover:text-purple-400 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-300 hover:text-purple-400 transition-colors">How It Works</a>
              <a href="#testimonials" className="text-gray-300 hover:text-purple-400 transition-colors">Reply Suggestions</a>
              <Link to="/plugin" className="text-gray-300 hover:text-purple-400 transition-colors">Plugin</Link>
              <Link to="/dashboard" className="text-gray-300 hover:text-purple-400 transition-colors">Dashboard</Link>
              <a href="#pricing" className="text-gray-300 hover:text-purple-400 transition-colors">Pricing</a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/auth")}
                className="text-gray-300 hover:text-white hover:bg-gray-800"
              >
                Login
              </Button>
              <Button 
                onClick={() => navigate("/auth")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                Sign Up Free
              </Button>
            </div>

            <button
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-800">
              <div className="flex flex-col gap-4">
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-purple-400 transition-colors py-2">Features</a>
                <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-purple-400 transition-colors py-2">How It Works</a>
                <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-purple-400 transition-colors py-2">Reply Suggestions</a>
                <Link to="/plugin" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-purple-400 transition-colors py-2">Plugin</Link>
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-purple-400 transition-colors py-2">Dashboard</Link>
                <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-purple-400 transition-colors py-2">Pricing</a>
                <div className="flex flex-col gap-2 pt-4 border-t border-gray-800">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/auth")}
                    className="w-full border-gray-700 text-gray-300"
                  >
                    Login
                  </Button>
                  <Button 
                    onClick={() => navigate("/auth")}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    Sign Up Free
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <section className="pt-24 pb-10 relative overflow-hidden">
        {/* Static Stars Background */}
        <StarsBackground starDensity={150} />
        
        {/* Shooting Stars Effect for Hero Section */}
        <ShootingStars
          starColor="#9E00FF"
          trailColor="#2EB9DF"
          minSpeed={15}
          maxSpeed={35}
          minDelay={1000}
          maxDelay={3000}
        />
        <ShootingStars
          starColor="#FF0099"
          trailColor="#FFB800"
          minSpeed={10}
          maxSpeed={25}
          minDelay={2000}
          maxDelay={4000}
        />
        
        <div className="container mx-auto px-6 relative z-10">
          <GridBackground
            title="Welcome to StyleTalk"
            description="Transform your messages with AI-powered context awareness. Communicate perfectly in any tone, any language, any situation."
            showAvailability={true}
            className="my-8"
          />
        </div>
      </section>

      <section id="features" className="py-20 lg:py-40 bg-black relative overflow-hidden">
        {/* Static Stars Background */}
        <StarsBackground starDensity={150} />
        
        {/* Shooting Stars Effect */}
        <ShootingStars
          starColor="#9E00FF"
          trailColor="#2EB9DF"
          minSpeed={15}
          maxSpeed={35}
          minDelay={1000}
          maxDelay={3000}
        />
        <ShootingStars
          starColor="#FF0099"
          trailColor="#FFB800"
          minSpeed={10}
          maxSpeed={25}
          minDelay={2000}
          maxDelay={4000}
        />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Why Choose StyleTalk AI?
            </h2>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto">
              Intelligent features designed to make every conversation effortless and impactful
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 md:gap-2 max-w-7xl mx-auto">
            {featuresData.map((feature) => (
              <div
                key={feature.title}
                className="relative bg-gradient-to-b dark:from-neutral-900 from-neutral-100 dark:to-neutral-950 to-white p-6 rounded-3xl overflow-hidden"
              >
                <Grid size={20} />
                <p className="text-base font-bold text-neutral-800 dark:text-white relative z-20">
                  {feature.title}
                </p>
                <p className="text-neutral-600 dark:text-neutral-400 mt-4 text-base font-normal relative z-20">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 bg-black min-h-screen relative overflow-hidden">
        {/* Static Stars Background */}
        <StarsBackground starDensity={150} />
        
        {/* Shooting Stars Effect for How It Works Section */}
        <ShootingStars
          starColor="#00FF9E"
          trailColor="#00B8FF"
          minSpeed={20}
          maxSpeed={40}
          minDelay={1500}
          maxDelay={3500}
        />
        <ShootingStars
          starColor="#9E00FF"
          trailColor="#FF0099"
          minSpeed={12}
          maxSpeed={28}
          minDelay={2500}
          maxDelay={4500}
        />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              How StyleTalk Works
            </h2>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-4">
              Get perfect message suggestions in 4 simple steps
            </p>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Click on any node to explore the step details • Auto-rotating timeline shows your journey
            </p>
          </div>

          <RadialOrbitalTimeline timelineData={timelineData} />
        </div>
      </section>

      {/* Testimonials Section with Draggable Component */}
      <section id="testimonials" className="py-20 bg-black relative overflow-hidden">
        {/* Static Stars Background */}
        <StarsBackground starDensity={120} />
        
        {/* Shooting Stars Effect */}
        <ShootingStars
          starColor="#9E00FF"
          trailColor="#FF0099"
          minSpeed={15}
          maxSpeed={30}
          minDelay={1500}
          maxDelay={3500}
        />
        <ShootingStars
          starColor="#00FF9E"
          trailColor="#00B8FF"
          minSpeed={12}
          maxSpeed={28}
          minDelay={2000}
          maxDelay={4000}
        />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Left Side - Draggable Testimonials */}
            <div className="order-2 lg:order-1">
              <DraggableTestimonials />
            </div>

            {/* Right Side - Text Content */}
            <div className="order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full mb-4 border border-purple-500/30">
                <MessageSquare className="w-4 h-4" />
                <span className="font-semibold">Real User Experiences</span>
              </div>
              
              <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
                Smart Reply Suggestions That Actually Work
              </h2>
              
              <p className="text-xl text-gray-400 leading-relaxed">
                Join thousands of professionals who are transforming their communication with StyleTalk AI. 
                Our intelligent reply suggestions understand context, tone, and relationship dynamics to help you 
                communicate perfectly in any situation.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Context-Aware Analysis</h4>
                    <p className="text-gray-400 text-sm">
                      Our AI detects emotion, intent, and relationship to suggest the perfect response every time.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Multiple Tone Options</h4>
                    <p className="text-gray-400 text-sm">
                      Choose from Formal, Polite, Casual, Gen-Z, and Friends styles for any conversation.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Instant Results</h4>
                    <p className="text-gray-400 text-sm">
                      Get AI-powered suggestions in under 3 seconds. Copy, paste, or customize as needed.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Button 
                  onClick={() => navigate("/dashboard")}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg font-semibold rounded-xl"
                >
                  Try Reply Suggestions Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-purple-900/20 to-pink-900/20 relative overflow-hidden">
        {/* Static Stars Background */}
        <StarsBackground starDensity={100} />
        
        {/* Shooting Stars Effect */}
        <ShootingStars
          starColor="#9E00FF"
          trailColor="#2EB9DF"
          minSpeed={15}
          maxSpeed={30}
          minDelay={1800}
          maxDelay={3500}
        />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full mb-4 border border-purple-500/30">
                <Puzzle className="w-4 h-4" />
                <span className="font-semibold">Browser Extension</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Use StyleTalk Everywhere
              </h2>
              <p className="text-gray-400 text-xl max-w-2xl mx-auto">
                Install our browser plugin and get real-time suggestions on WhatsApp, Gmail, Instagram, LinkedIn, and any web chat!
              </p>
            </div>

            <div className="bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-700">
              <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-purple-500/30">
                      <MessageSquare className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white mb-2">Universal Overlay</h3>
                      <p className="text-gray-400 text-sm">
                        Works seamlessly on all web-based messaging platforms
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                      <Shield className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white mb-2">Privacy-First</h3>
                      <p className="text-gray-400 text-sm">
                        All processing happens locally in your browser
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-green-500/30">
                      <Zap className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white mb-2">Instant Suggestions</h3>
                      <p className="text-gray-400 text-sm">
                        Real-time context analysis and tone recommendations
                      </p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button 
                      onClick={() => navigate("/plugin")}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-6 text-lg font-semibold rounded-xl hover:shadow-lg transition-all duration-300 w-full md:w-auto"
                    >
                      <Chrome className="w-5 h-5 mr-2" />
                      Download Plugin
                    </Button>
                  </div>
                </div>

                <div className="relative">
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-6 h-full flex items-center justify-center border border-purple-500/20">
                    <div className="text-center">
                      <Puzzle className="w-24 h-24 text-purple-400 mx-auto mb-4" />
                      <p className="text-white font-semibold text-lg mb-2">
                        Available for Chrome, Firefox & Edge
                      </p>
                      <p className="text-gray-400 text-sm">
                        One-click installation
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 bg-black">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-8">
              Choose the plan that fits your needs
            </p>
            
            {/* Toggle Switch */}
            <div className="inline-flex items-center bg-black/[0.03] dark:bg-white/[0.03] rounded-full p-1 border border-white/10">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  !isAnnual
                    ? 'bg-white text-black shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  isAnnual
                    ? 'bg-white text-black shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Annual
                <span className="ml-2 text-xs text-green-500">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white/[0.02] rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all">
              <h3 className="text-2xl font-semibold text-white mb-2">Free</h3>
              <p className="text-gray-400 text-sm mb-6">Perfect for trying out StyleTalk</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">₹0</span>
                <span className="text-gray-400 text-sm ml-2">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">10 suggestions per day</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">3 tone styles</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Basic features</span>
                </li>
              </ul>
              <Button 
                onClick={() => navigate("/auth")}
                variant="outline" 
                className="w-full border-white/10 text-white hover:bg-white/5"
              >
                Get Started
              </Button>
            </div>

            {/* Pro Plan - Most Popular */}
            <div className="relative bg-white/[0.05] rounded-2xl p-8 border-2 border-white/20 hover:border-white/30 transition-all transform md:scale-105 shadow-2xl">
              {/* Most Popular Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-50"></div>
                  <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                    MOST POPULAR
                  </div>
                </div>
              </div>
              
              <h3 className="text-2xl font-semibold text-white mb-2 mt-2">Pro</h3>
              <p className="text-gray-400 text-sm mb-6">For power users</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">
                  {isAnnual ? '₹1,099' : '₹99'}
                </span>
                <span className="text-gray-400 text-sm ml-2">
                  /{isAnnual ? 'year' : 'month'}
                </span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-gray-200">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Unlimited suggestions</span>
                </li>
                <li className="flex items-start gap-3 text-gray-200">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">All tone styles</span>
                </li>
                <li className="flex items-start gap-3 text-gray-200">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Context analysis</span>
                </li>
                <li className="flex items-start gap-3 text-gray-200">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Cultural sensitivity</span>
                </li>
                <li className="flex items-start gap-3 text-gray-200">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Browser plugin</span>
                </li>
              </ul>
              <Button 
                onClick={() => navigate("/auth")}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
              >
                Start Free Trial
              </Button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white/[0.02] rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all">
              <h3 className="text-2xl font-semibold text-white mb-2">Enterprise</h3>
              <p className="text-gray-400 text-sm mb-6">For teams and organizations</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">Custom</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Everything in Pro</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Team collaboration</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Custom AI training</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Priority support</span>
                </li>
              </ul>
              <Button 
                onClick={() => navigate("/auth")}
                variant="outline" 
                className="w-full border-white/10 text-white hover:bg-white/5"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 relative overflow-hidden">
        {/* Static Stars Background */}
        <StarsBackground starDensity={100} />
        
        {/* Shooting Stars Effect for CTA Section */}
        <ShootingStars
          starColor="#FFFFFF"
          trailColor="#FFD700"
          minSpeed={25}
          maxSpeed={45}
          minDelay={1000}
          maxDelay={2500}
        />
        <ShootingStars
          starColor="#FFB8FF"
          trailColor="#FFFFFF"
          minSpeed={18}
          maxSpeed={35}
          minDelay={1800}
          maxDelay={3200}
        />
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
            Ready to Transform Your Communication?
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join thousands of users who are already expressing themselves perfectly with StyleTalk AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate("/auth")}
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold rounded-xl transform hover:scale-105 transition-all duration-300"
            >
              Start Free Trial
            </Button>
            <Button 
              onClick={() => navigate("/plugin")}
              className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300"
            >
              Get Browser Plugin
            </Button>
          </div>
        </div>
      </section>

      <footer className="bg-black border-t border-gray-800 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">StyleTalk</span>
              </div>
              <p className="text-gray-400 text-sm">
                Transform your messages with AI-powered intelligence.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link to="/dashboard" className="text-gray-400 hover:text-purple-400 transition-colors">Dashboard</Link></li>
                <li><Link to="/plugin" className="text-gray-400 hover:text-purple-400 transition-colors">Plugin</Link></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-purple-400 transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Careers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Privacy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Terms</a></li>
                <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400 text-sm">
               2025 StyleTalk. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Grid Pattern Components
const Grid = ({
  pattern,
  size,
}: {
  pattern?: number[][];
  size?: number;
}) => {
  const p = pattern ?? [
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
  ];
  return (
    <div className="pointer-events-none absolute left-1/2 top-0 -ml-20 -mt-2 h-full w-full [mask-image:linear-gradient(white,transparent)]">
      <div className="absolute inset-0 bg-gradient-to-r [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] dark:from-zinc-900/30 from-zinc-100/30 to-zinc-300/30 dark:to-zinc-900/30 opacity-100">
        <GridPattern
          width={size ?? 20}
          height={size ?? 20}
          x="-12"
          y="4"
          squares={p}
          className="absolute inset-0 h-full w-full mix-blend-overlay dark:fill-white/10 dark:stroke-white/10 stroke-black/10 fill-black/10"
        />
      </div>
    </div>
  );
};

function GridPattern({ width, height, x, y, squares, ...props }: any) {
  const patternId = useId();

  return (
    <svg aria-hidden="true" {...props}>
      <defs>
        <pattern
          id={patternId}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        strokeWidth={0}
        fill={`url(#${patternId})`}
      />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([x, y]: any) => (
            <rect
              strokeWidth="0"
              key={`${x}-${y}`}
              width={width + 1}
              height={height + 1}
              x={x * width}
              y={y * height}
            />
          ))}
        </svg>
      )}
    </svg>
  );
}

export default Landing;
