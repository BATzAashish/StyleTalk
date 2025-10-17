import { Button } from "@/components/ui/button";
import { Sparkles, MessageSquare, Zap, Users, Play, Clock, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-bg.jpg";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-4 bg-black/90 text-white">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate("/")}
        >
          <Sparkles className="w-6 h-6 text-purple-400" />
          <span className="text-xl font-bold">StyleTalk</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-purple-400 transition-colors">HOME</a>
          <a href="#" className="hover:text-purple-400 transition-colors">ABOUT</a>
          <a href="#" className="hover:text-purple-400 transition-colors">FEATURES</a>
          <a href="#" className="hover:text-purple-400 transition-colors">PRICING</a>
          <a href="#" className="hover:text-purple-400 transition-colors">BLOG</a>
          <a href="#" className="hover:text-purple-400 transition-colors">CONTACT</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Modern Tech Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Floating Geometric Shapes */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-pink-500/10 rounded-lg rotate-45 animate-bounce"></div>
          <div className="absolute bottom-40 left-20 w-20 h-20 bg-blue-500/10 rounded-full animate-ping"></div>
          <div className="absolute bottom-20 right-40 w-28 h-28 bg-purple-500/10 rounded-lg animate-pulse"></div>
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="grid grid-cols-12 gap-4 h-full p-8">
              {Array.from({length: 48}).map((_, i) => (
                <div key={i} className="border border-white/20"></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="relative container mx-auto px-6 py-32 flex items-center min-h-screen">
          <div className="max-w-2xl">
            <p className="text-purple-300 text-sm font-medium mb-4 tracking-wide uppercase animate-fade-in">
              NOW YOU CAN FEEL THE POWER
            </p>
            
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight animate-slide-up">
              Transform your 
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {" "}messages{" "}
              </span>
              with AI
            </h1>
            
            <Button 
              onClick={() => navigate("/auth")}
              className="bg-white text-black hover:bg-gray-100 px-8 py-3 rounded-full font-semibold transform hover:scale-105 transition-all duration-300 animate-scale-in"
            >
              TRY NOW
            </Button>
          </div>

          {/* Animated Tablet Mockup */}
          <div className="absolute right-5 top-1/2 transform -translate-y-1/2 hidden lg:block">
            <div className="relative">
              {/* Tablet Frame with Animation */}
              <div className="w-96 h-[500px] bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-4 shadow-2xl transform hover:scale-105 transition-all duration-500">
                <div className="w-full h-full bg-white rounded-2xl p-4 flex flex-col overflow-hidden">
                  {/* Chat Header */}
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">A</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Alex</p>
                      <p className="text-xs text-green-500">● online</p>
                    </div>
                  </div>
                  
                  {/* App Interface */}
                  <div className="flex-1 space-y-3 pb-4">
                    {/* Received Message */}
                    <div className="bg-gray-50 p-3 rounded-lg animate-message-in">
                      <p className="text-xs text-gray-500 mb-2">Message You Received:</p>
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <p className="text-sm text-gray-800">"Thanks for the invitation"</p>
                      </div>
                    </div>
                    
                    {/* StyleTalk Reply Suggestions */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-200 animate-message-in" style={{animationDelay: '1s'}}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-500" />
                          <p className="text-xs font-semibold text-purple-700">Reply Suggestions</p>
                        </div>
                        <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">4 styles</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="bg-blue-50 border border-blue-200 p-2 rounded-lg animate-fade-in" style={{animationDelay: '1.5s'}}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-medium text-blue-700 flex items-center gap-1">
                              📝 Formal <span className="bg-purple-500 text-white text-xs px-1 rounded">Recommended</span>
                            </p>
                            <div className="flex gap-1">
                              <button className="text-gray-400 hover:text-gray-600"><span className="text-xs">📋</span></button>
                              <button className="text-gray-400 hover:text-gray-600"><span className="text-xs">�</span></button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-700">"I appreciate your message. I would be delighted to discuss this matter further at your earliest convenience."</p>
                        </div>
                        
                        <div className="bg-green-50 border border-green-200 p-2 rounded-lg animate-fade-in" style={{animationDelay: '1.8s'}}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-medium text-green-700">😊 Casual</p>
                            <div className="flex gap-1">
                              <button className="text-gray-400 hover:text-gray-600"><span className="text-xs">📋</span></button>
                              <button className="text-gray-400 hover:text-gray-600"><span className="text-xs">📤</span></button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-700">"Hey! Thanks for reaching out. I'd love to chat about this when you're free!"</p>
                        </div>
                        
                        <div className="bg-pink-50 border border-pink-200 p-2 rounded-lg animate-fade-in" style={{animationDelay: '2.1s'}}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-medium text-pink-700">🔥 Gen-Z</p>
                            <div className="flex gap-1">
                              <button className="text-gray-400 hover:text-gray-600"><span className="text-xs">📋</span></button>
                              <button className="text-gray-400 hover:text-gray-600"><span className="text-xs">�</span></button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-700">"omg yes!! this sounds amazing bestie 💅✨"</p>
                        </div>
                        
                        <div className="bg-orange-50 border border-orange-200 p-2 rounded-lg animate-fade-in" style={{animationDelay: '2.4s'}}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-medium text-orange-700">😎 Cool</p>
                            <div className="flex gap-1">
                              <button className="text-gray-400 hover:text-gray-600"><span className="text-xs">📋</span></button>
                              <button className="text-gray-400 hover:text-gray-600"><span className="text-xs">�</span></button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-700">"Thanks! Sounds good, let me know what works 😎"</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating AI Badge */}
              <div className="absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-float shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              
              {/* Floating Stats */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-3 shadow-lg border animate-bounce">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-semibold">AI Active</span>
                </div>
                <p className="text-xs text-gray-600">Real-time suggestions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" className="w-full h-20 fill-white">
            <path d="M0,80 C300,120 900,40 1200,80 L1200,120 L0,120 Z" />
          </svg>
        </div>
      </section>

      {/* Demo/Video Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Video/Demo Area */}
            <div className="relative">
              <div className="bg-black rounded-2xl overflow-hidden shadow-2xl">
                <div className="aspect-video bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:scale-110 transition-transform duration-300">
                      <Play className="w-10 h-10 text-white ml-1" />
                    </div>
                    <p className="text-white/80 text-sm">Watch StyleTalk AI in Action</p>
                  </div>
                </div>
              </div>
              
              {/* Floating Stats */}
              <div className="absolute -top-6 -right-6 bg-white rounded-2xl p-4 shadow-lg border">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold">Live Processing</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">1M+ messages transformed</p>
              </div>
              
              <div className="absolute -bottom-6 -left-6 bg-purple-500 text-white rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-semibold">2.3s avg</span>
                </div>
                <p className="text-xs opacity-90">Response time</p>
              </div>
            </div>

            {/* Content */}
            <div>
              <p className="text-purple-600 text-sm font-medium mb-4 tracking-wide uppercase">
                LIVE AI TRANSFORMATION
              </p>
              
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                We Transform Your 
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  {" "}Messages Live
                </span>
              </h2>
              
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Watch as our AI instantly converts your thoughts into perfectly crafted messages. 
                From casual texts to professional emails, we deliver excellence in real-time.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">Instant style transformation</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">Multiple tone options</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">Context-aware suggestions</span>
                </div>
              </div>
              
              <div className="mt-8">
                <div className="text-2xl font-bold text-gray-900 mb-2">— StyleTalk Team</div>
                <p className="text-gray-500 italic">Making communication effortless for everyone</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose StyleTalk AI?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Intelligent features designed to make every conversation effortless and impactful
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Multiple Styles</h3>
              <p className="text-gray-600 leading-relaxed">
                Generate responses in formal, casual, funny, Gen-Z, and more—all from a single input. Perfect for any situation.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Lightning Fast</h3>
              <p className="text-gray-600 leading-relaxed">
                AI-powered responses in under 3 seconds. Copy and paste, or export directly to your favorite messaging apps.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Globe className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Global Reach</h3>
              <p className="text-gray-600 leading-relaxed">
                Support for multiple languages and cultural contexts. Communicate effectively with anyone, anywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Communication?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already expressing themselves perfectly with StyleTalk AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate("/auth")}
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-full transform hover:scale-105 transition-all duration-300"
            >
              Start Free Trial
            </Button>
            <Button 
              onClick={() => navigate("/auth")}
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300"
            >
              View Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
