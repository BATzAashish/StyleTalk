import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Heart, Smile, Frown, AlertCircle, ThumbsUp, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import ResponseCard from "@/components/dashboard/ResponseCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

interface Response {
  style: string;
  content: string;
  color: string;
  sentiment?: string;
  isRecommended?: boolean;
  emojis?: string[];
  gifSuggestion?: string;
}

interface AnalysisResult {
  emotion: string;
  intent: string;
  relationship: string;
  culturalNote?: string;
}

const Dashboard = () => {
  const [input, setInput] = useState("");
  const [responses, setResponses] = useState<Response[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedRelationship, setSelectedRelationship] = useState<string>("auto");

  // Mock AI analysis function
  const analyzeMessage = (text: string): AnalysisResult => {
    const lowerText = text.toLowerCase();
    
    // Detect emotion
    let emotion = "neutral";
    if (lowerText.includes("thanks") || lowerText.includes("appreciate") || lowerText.includes("congrat")) {
      emotion = "positive";
    } else if (lowerText.includes("sorry") || lowerText.includes("apologize") || lowerText.includes("unfortunately")) {
      emotion = "apologetic";
    } else if (lowerText.includes("urgent") || lowerText.includes("immediately") || lowerText.includes("asap")) {
      emotion = "urgent";
    } else if (lowerText.includes("angry") || lowerText.includes("disappointed") || lowerText.includes("unacceptable")) {
      emotion = "negative";
    }
    
    // Detect intent
    let intent = "general";
    if (lowerText.includes("thank") || lowerText.includes("appreciate")) {
      intent = "gratitude";
    } else if (lowerText.includes("meeting") || lowerText.includes("schedule") || lowerText.includes("appointment")) {
      intent = "scheduling";
    } else if (lowerText.includes("congrat") || lowerText.includes("celebration")) {
      intent = "congratulations";
    } else if (lowerText.includes("sorry") || lowerText.includes("apologize")) {
      intent = "apology";
    } else if (lowerText.includes("request") || lowerText.includes("could you") || lowerText.includes("would you")) {
      intent = "request";
    }
    
    // Detect relationship (if not manually selected)
    let relationship = selectedRelationship;
    if (selectedRelationship === "auto") {
      if (lowerText.includes("sir") || lowerText.includes("madam") || lowerText.includes("mr") || lowerText.includes("ms")) {
        relationship = "professional";
      } else if (lowerText.includes("buddy") || lowerText.includes("dude") || lowerText.includes("bro")) {
        relationship = "friend";
      } else {
        relationship = "neutral";
      }
    }
    
    return { emotion, intent, relationship };
  };

  const mockGenerate = (detectedAnalysis: AnalysisResult) => {
    const styles: Response[] = [
      {
        style: "Formal",
        content: detectedAnalysis.intent === "gratitude" 
          ? "I sincerely appreciate your message. It would be my pleasure to discuss this matter further at your earliest convenience."
          : "I acknowledge receipt of your message. I would be delighted to address this matter with you.",
        color: "bg-blue-100 text-blue-900 border-blue-200",
        sentiment: "Professional",
        isRecommended: detectedAnalysis.relationship === "professional",
        emojis: ["📧", "✉️", "📝"],
        gifSuggestion: "professional-handshake"
      },
      {
        style: "Polite",
        content: detectedAnalysis.intent === "gratitude"
          ? "Thank you so much for your message! I really appreciate it and would love to chat more about this."
          : "Thanks for reaching out! I'd be happy to discuss this with you whenever you're available.",
        color: "bg-green-100 text-green-900 border-green-200",
        sentiment: "Friendly & Respectful",
        isRecommended: detectedAnalysis.relationship === "neutral",
        emojis: ["😊", "🙏", "💚"],
        gifSuggestion: "thank-you-smile"
      },
      {
        style: "Casual",
        content: detectedAnalysis.intent === "gratitude"
          ? "Hey! Thanks for the message, really appreciate it! Let's catch up soon."
          : "Hey there! Got your message - let me know when you want to chat about it!",
        color: "bg-purple-100 text-purple-900 border-purple-200",
        sentiment: "Relaxed & Easy-going",
        emojis: ["👋", "😄", "✨"],
        gifSuggestion: "casual-wave"
      },
      {
        style: "Gen-Z",
        content: detectedAnalysis.intent === "gratitude"
          ? "omg tysm for reaching out!! 💕 lowkey so hyped about this fr fr no cap 🔥"
          : "yooo thanks for the msg!! let's link up and discuss this fr 💯",
        color: "bg-pink-100 text-pink-900 border-pink-200",
        sentiment: "Enthusiastic & Trendy",
        isRecommended: detectedAnalysis.relationship === "friend",
        emojis: ["💯", "🔥", "✨", "💕", "🤙"],
        gifSuggestion: "excited-celebration"
      },
      {
        style: "Empathetic",
        content: detectedAnalysis.emotion === "negative" || detectedAnalysis.emotion === "apologetic"
          ? "I truly understand how you feel, and I'm here to help resolve this. Let's work together to find a solution."
          : "I really appreciate you sharing this with me. Your thoughts and feelings matter, and I'm here to support you.",
        color: "bg-amber-100 text-amber-900 border-amber-200",
        sentiment: "Understanding & Supportive",
        isRecommended: detectedAnalysis.emotion === "negative" || detectedAnalysis.emotion === "apologetic",
        emojis: ["🤗", "💙", "🫂"],
        gifSuggestion: "supportive-hug"
      },
    ];
    return styles;
  };

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast.error("Please enter a message to get reply suggestions");
      return;
    }

    setIsGenerating(true);
    
    // Simulate API call
    setTimeout(() => {
      // First analyze the message
      const detectedAnalysis = analyzeMessage(input);
      setAnalysis(detectedAnalysis);
      
      // Then generate responses based on analysis
      const newResponses = mockGenerate(detectedAnalysis);
      setResponses(newResponses);
      setIsGenerating(false);
      toast.success("Reply suggestions generated with context analysis!");
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="flex-1 w-full bg-black overflow-y-auto">
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Smart Reply Suggestions</h1>
                <p className="text-sm text-gray-400 mt-1">AI-powered context-aware message responses</p>
              </div>
            </div>
          </div>
        </header>

        <div className="px-8 py-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="shadow-medium animate-fade-in bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Message You Received</CardTitle>
                <CardDescription className="text-gray-400">
                  Paste a message you received, and we'll analyze context & suggest multiple reply styles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste the message you want to reply to..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[200px] resize-none bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                />
                
                {/* Relationship Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Relationship with Sender (Optional)</label>
                  <Select value={selectedRelationship} onValueChange={setSelectedRelationship}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Auto-detect relationship" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="auto" className="text-white">Auto-detect</SelectItem>
                      <SelectItem value="professional" className="text-white">Boss/Manager</SelectItem>
                      <SelectItem value="colleague" className="text-white">Colleague/Coworker</SelectItem>
                      <SelectItem value="client" className="text-white">Client/Customer</SelectItem>
                      <SelectItem value="neutral" className="text-white">Acquaintance</SelectItem>
                      <SelectItem value="friend" className="text-white">Friend</SelectItem>
                      <SelectItem value="family" className="text-white">Family</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleGenerate} 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  size="lg"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing & Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Smart Reply Suggestions
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            {analysis && (
              <Card className="shadow-soft animate-fade-in border-2 border-purple-500/30 bg-purple-900/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-white">
                    <AlertCircle className="w-5 h-5 text-purple-400" />
                    Context Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-300">Detected Emotion:</span>
                    <Badge variant="outline" className="capitalize text-purple-300 border-purple-500">
                      {analysis.emotion === "positive" && <Smile className="w-3 h-3 mr-1" />}
                      {analysis.emotion === "negative" && <Frown className="w-3 h-3 mr-1" />}
                      {analysis.emotion === "apologetic" && <Heart className="w-3 h-3 mr-1" />}
                      {analysis.emotion}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-300">Detected Intent:</span>
                    <Badge variant="outline" className="capitalize text-purple-300 border-purple-500">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      {analysis.intent}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-300">Relationship:</span>
                    <Badge variant="outline" className="capitalize text-purple-300 border-purple-500">
                      {analysis.relationship}
                    </Badge>
                  </div>
                  {analysis.culturalNote && (
                    <div className="mt-2 p-3 bg-amber-900/30 border border-amber-700 rounded-md">
                      <p className="text-sm text-amber-300">
                        <strong>Cultural Note:</strong> {analysis.culturalNote}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Sample Prompts */}
            <Card className="shadow-soft animate-fade-in bg-gray-900 border-gray-800" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle className="text-lg text-white">Try These Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  "Thanks for the invitation to the meeting",
                  "I need to reschedule our appointment",
                  "Congratulations on your promotion!",
                  "Sorry for the delay in responding",
                ].map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(example)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-800 transition-colors text-sm text-gray-300"
                  >
                    "{example}"
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Responses Section */}
          <div className="space-y-6">
            {responses.length === 0 ? (
              <Card className="shadow-soft animate-fade-in bg-gray-900 border-gray-800">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">No suggestions yet</h3>
                  <p className="text-gray-400 max-w-sm">
                    Enter a message and click "Generate Smart Reply Suggestions" to see context-aware responses
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Suggested Replies</h2>
                  <Badge variant="secondary" className="bg-purple-900/50 text-purple-300">
                    {responses.length} styles
                  </Badge>
                </div>
                
                {responses.map((response, index) => (
                  <ResponseCard
                    key={index}
                    title={response.style}
                    content={response.content}
                    color={response.color}
                    sentiment={response.sentiment}
                    isRecommended={response.isRecommended}
                    index={index}
                    emojis={response.emojis}
                    gifSuggestion={response.gifSuggestion}
                  />
                ))}
              </>
            )}
          </div>
        </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
