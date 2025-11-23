import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Chrome, Download, CheckCircle2, Zap, Shield, Globe, MessageSquare, Brain, Puzzle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useState, useEffect } from "react";

interface PluginInfo {
  name: string;
  version: string;
  description: string;
  features: string[];
  supported_browsers: string[];
  platforms: string[];
  size: string;
  download_url: string;
  install_guide_url: string;
}

interface InstallationGuide {
  chrome: {
    steps: string[];
    troubleshooting: Array<{ issue: string; solution: string }>;
  };
  edge: {
    steps: string[];
  };
  general_tips: string[];
}

const Plugin = () => {
  const [pluginInfo, setPluginInfo] = useState<PluginInfo | null>(null);
  const [installGuide, setInstallGuide] = useState<InstallationGuide | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPluginInfo();
    fetchInstallGuide();
  }, []);

  const fetchPluginInfo = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/plugin/info');
      const data = await response.json();
      setPluginInfo(data);
    } catch (error) {
      console.error('Failed to fetch plugin info:', error);
      toast.error('Failed to load plugin information');
    } finally {
      setLoading(false);
    }
  };

  const fetchInstallGuide = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/plugin/guide');
      const data = await response.json();
      setInstallGuide(data);
    } catch (error) {
      console.error('Failed to fetch install guide:', error);
    }
  };

  const handleDownload = async () => {
    try {
      toast.info('Preparing download...');
      
      // Create download link
      const downloadUrl = 'http://localhost:5000/api/plugin/download';
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'styletalk-extension-v1.0.0.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Download started! Follow the installation guide below.');
      
      // Scroll to installation guide
      setTimeout(() => {
        document.getElementById('install-guide')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download extension');
    }
  };

  const handleViewGuide = () => {
    document.getElementById('install-guide')?.scrollIntoView({ behavior: 'smooth' });
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

          {/* Download Section */}
          <div className="mb-16">
            <Card className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500 hover:shadow-2xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-3xl text-white mb-2">
                  Download StyleTalk Extension
                </CardTitle>
                <CardDescription className="text-gray-300 text-lg">
                  {loading ? 'Loading...' : `${pluginInfo?.name} v${pluginInfo?.version} • ${pluginInfo?.size}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-6 text-lg font-semibold"
                    onClick={handleDownload}
                    disabled={loading}
                  >
                    <Download className="w-6 h-6 mr-3" />
                    Download for Chrome, Edge & Brave
                  </Button>
                  <p className="text-gray-400 text-sm mt-3">
                    Works on Chrome, Edge, Brave, and Opera
                  </p>
                </div>
                
                <div className="flex justify-center gap-4 pt-4">
                  <Button 
                    variant="outline" 
                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                    onClick={handleViewGuide}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Installation Guide
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Supported Browsers */}
          {pluginInfo && (
            <div className="grid md:grid-cols-4 gap-4 mb-16">
              {pluginInfo.supported_browsers.map((browser) => (
                <Card key={browser} className="bg-gray-900 border-gray-800 text-center">
                  <CardContent className="pt-6">
                    <Chrome className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                    <p className="text-white font-medium">{browser}</p>
                    <Badge variant="secondary" className="mt-2 bg-green-900/50 text-green-300">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Supported
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

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

          {/* Installation Guide */}
          <div id="install-guide" className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8 text-white">Installation Guide</h2>
            {installGuide && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Chrome Guide */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <Chrome className="w-8 h-8 text-blue-500 mb-2" />
                    <CardTitle className="text-white">Chrome / Edge / Brave</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ol className="list-decimal list-inside space-y-2 text-gray-300">
                      {installGuide.chrome.steps.map((step, index) => (
                        <li key={index} className="text-sm">{step}</li>
                      ))}
                    </ol>
                    
                    {installGuide.chrome.troubleshooting && (
                      <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                        <h4 className="text-sm font-semibold text-white mb-2">Troubleshooting</h4>
                        <div className="space-y-2">
                          {installGuide.chrome.troubleshooting.map((item, index) => (
                            <div key={index} className="text-xs">
                              <span className="text-red-400 font-medium">{item.issue}:</span>
                              <span className="text-gray-400"> {item.solution}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* General Tips */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                    <CardTitle className="text-white">Pro Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-gray-300">
                      {installGuide.general_tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}
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
                onClick={handleDownload}
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
