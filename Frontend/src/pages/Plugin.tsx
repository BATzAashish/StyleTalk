import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Chrome, Download, CheckCircle2, Zap, Shield, Globe, MessageSquare, Brain, Puzzle } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const Plugin = () => {
  const handleDownload = (browser: string) => {
    toast.info(`${browser} extension coming soon! We're working hard to bring StyleTalk to your browser.`);
  };

  return (
    <DashboardLayout>
      <div className="flex-1 w-full bg-black overflow-y-auto">
        <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Browser Plugin</h1>
                <p className="text-sm text-gray-400 mt-1">Use StyleTalk AI everywhere you chat</p>
              </div>
            </div>
          </div>
        </header>

        <div className="px-8 py-12 max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16 space-y-4">
            <Badge variant="secondary" className="mb-4 bg-purple-900/50 text-purple-300 border-purple-500">
              <Puzzle className="w-3 h-3 mr-1" />
              Browser Extension
            </Badge>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              StyleTalk Browser Plugin
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Transform your messages in real-time across all your favorite platforms. 
              WhatsApp, Instagram, Email, LinkedIn, and more!
            </p>
          </div>

          {/* Download Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Card className="hover:shadow-lg transition-shadow bg-gray-900 border-gray-800">
              <CardHeader className="text-center">
                <Chrome className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                <CardTitle className="text-white">Chrome</CardTitle>
                <CardDescription className="text-gray-400">Most popular browser</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700" 
                  onClick={() => handleDownload("Chrome")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow bg-gray-900 border-gray-800">
              <CardHeader className="text-center">
                <Globe className="w-12 h-12 text-orange-500 mx-auto mb-2" />
                <CardTitle className="text-white">Firefox</CardTitle>
                <CardDescription className="text-gray-400">Privacy-focused</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-orange-600 hover:bg-orange-700" 
                  onClick={() => handleDownload("Firefox")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow bg-gray-900 border-gray-800">
              <CardHeader className="text-center">
                <Chrome className="w-12 h-12 text-teal-500 mx-auto mb-2" />
                <CardTitle className="text-white">Edge</CardTitle>
                <CardDescription className="text-gray-400">Microsoft browser</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-teal-600 hover:bg-teal-700" 
                  onClick={() => handleDownload("Edge")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Features Grid */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8 text-white">Plugin Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <MessageSquare className="w-8 h-8 text-purple-500 mb-2" />
                  <CardTitle className="text-white">Universal Compatibility</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    Works seamlessly on WhatsApp Web, Gmail, Instagram, LinkedIn, Twitter, and more.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <Zap className="w-8 h-8 text-yellow-500 mb-2" />
                  <CardTitle className="text-white">Instant Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    Get AI-powered reply suggestions in under 3 seconds, right where you type.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <Brain className="w-8 h-8 text-blue-500 mb-2" />
                  <CardTitle className="text-white">Context-Aware</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    Analyzes conversation context to suggest the perfect tone and style.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <Shield className="w-8 h-8 text-green-500 mb-2" />
                  <CardTitle className="text-white">Privacy First</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    All processing happens locally. Your messages stay private and secure.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <Globe className="w-8 h-8 text-indigo-500 mb-2" />
                  <CardTitle className="text-white">Multi-Language</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    Support for 15+ languages with cultural sensitivity and proper etiquette.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CheckCircle2 className="w-8 h-8 text-pink-500 mb-2" />
                  <CardTitle className="text-white">Easy to Use</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    Simple one-click interface. No complicated setup or configuration needed.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Installation Steps */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8 text-white">How to Install</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-purple-900/50 text-purple-300 border border-purple-500 rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                  1
                </div>
                <h3 className="font-bold text-lg text-white">Download</h3>
                <p className="text-gray-400 text-sm">
                  Click the download button for your preferred browser
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-purple-900/50 text-purple-300 border border-purple-500 rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                  2
                </div>
                <h3 className="font-bold text-lg text-white">Install</h3>
                <p className="text-gray-400 text-sm">
                  Follow the simple installation prompts in your browser
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-purple-900/50 text-purple-300 border border-purple-500 rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                  3
                </div>
                <h3 className="font-bold text-lg text-white">Start Typing</h3>
                <p className="text-gray-400 text-sm">
                  Open any messaging platform and see StyleTalk in action!
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Messages?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Join thousands of users who are already communicating better with StyleTalk AI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100"
                onClick={() => handleDownload("Chrome")}
              >
                <Download className="w-5 h-5 mr-2" />
                Download Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Plugin;
