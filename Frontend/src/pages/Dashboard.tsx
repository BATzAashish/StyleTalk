import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Heart, Smile, Frown, AlertCircle, ThumbsUp, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import ResponseCard from "@/components/dashboard/ResponseCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { toneAPI } from "@/lib/api";
import { searchGifsByTone, TenorGif } from "@/lib/tenor";

interface Response {
  style: string;
  content: string;
  color: string;
  sentiment?: string;
  isRecommended?: boolean;
  emojis?: string[];
  gifs?: TenorGif[];
  gifSuggestion?: string;
  cached?: boolean;
  cacheHitCount?: number;
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
  const [currentResponseIndex, setCurrentResponseIndex] = useState(0);
  const [additionalContext, setAdditionalContext] = useState("");

  // Navigation handlers
  const handlePreviousResponse = () => {
    setCurrentResponseIndex((prev) => (prev > 0 ? prev - 1 : responses.length - 1));
  };

  const handleNextResponse = () => {
    setCurrentResponseIndex((prev) => (prev < responses.length - 1 ? prev + 1 : 0));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (responses.length === 0) return;
      
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePreviousResponse();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNextResponse();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [responses.length, currentResponseIndex]);

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
        content: detectedAnalysis.relationship === "professional"
          ? (detectedAnalysis.intent === "gratitude" 
              ? "honestly appreciate you reaching out! this sounds super interesting ngl, would love to discuss more 💯"
              : "hey! got your message - this actually seems pretty cool, lmk when works for you to chat! 🔥")
          : detectedAnalysis.relationship === "family"
          ? (detectedAnalysis.intent === "gratitude"
              ? "aww thanks for checking in!! lowkey really appreciate it 💕 miss you fr"
              : "heyy! got your message - sounds good, just lmk what works! 😊✨")
          : (detectedAnalysis.intent === "gratitude"
              ? "omg tysm for reaching out!! 💕 lowkey so hyped about this fr fr no cap 🔥"
              : "yooo thanks for the msg!! let's link up and discuss this fr 💯"),
        color: "bg-pink-100 text-pink-900 border-pink-200",
        sentiment: "Trendy & Authentic",
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

  // Helper function to get color for tone
  const getColorForTone = (tone: string): string => {
    const colorMap: Record<string, string> = {
      professional: "bg-blue-100 text-blue-900 border-blue-200",
      formal: "bg-indigo-100 text-indigo-900 border-indigo-200",
      friendly: "bg-green-100 text-green-900 border-green-200",
      casual: "bg-purple-100 text-purple-900 border-purple-200",
      empathetic: "bg-amber-100 text-amber-900 border-amber-200",
      confident: "bg-red-100 text-red-900 border-red-200",
      enthusiastic: "bg-pink-100 text-pink-900 border-pink-200",
      genz: "bg-pink-100 text-pink-900 border-pink-200",
    };
    return colorMap[tone] || "bg-gray-100 text-gray-900 border-gray-200";
  };

  // Helper function to get emojis for tone
  const getEmojisForTone = (tone: string): string[] => {
    const emojiMap: Record<string, string[]> = {
      professional: ["📧", "💼", "📝"],
      formal: ["👔", "🎩", "📄"],
      friendly: ["😊", "🙏", "💚"],
      casual: ["👋", "😄", "✨"],
      empathetic: ["🤗", "💙", "🫂"],
      confident: ["💪", "🎯", "🔥"],
      enthusiastic: ["🎉", "✨", "🚀"],
      genz: ["💯", "🔥", "✨", "💕", "🤙"],
    };
    return emojiMap[tone] || ["✨"];
  };

  // Helper function to get sentiment description
  const getSentimentForTone = (tone: string): string => {
    const sentimentMap: Record<string, string> = {
      professional: "Professional",
      formal: "Very Formal",
      friendly: "Friendly & Respectful",
      casual: "Relaxed & Easy-going",
      empathetic: "Understanding & Supportive",
      confident: "Strong & Assertive",
      enthusiastic: "Energetic & Positive",
      genz: "Trendy & Modern",
    };
    return sentimentMap[tone] || "Balanced";
  };

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast.error("Please enter a message to get reply suggestions");
      return;
    }

    setIsGenerating(true);
    
    try {
      // First analyze the message locally
      const detectedAnalysis = analyzeMessage(input);
      setAnalysis(detectedAnalysis);
      
      // Define tones to generate - ALWAYS include gen-z for all relationships
      let tonesToGenerate: string[] = [];
      
      if (detectedAnalysis.relationship === "professional") {
        // Professional context: formal tones + tailored gen-z
        tonesToGenerate = ["professional", "formal", "friendly", "genz", "empathetic"];
      } else if (detectedAnalysis.relationship === "friend") {
        // Friend context: casual tones + authentic gen-z
        tonesToGenerate = ["casual", "friendly", "genz", "enthusiastic", "empathetic"];
      } else if (detectedAnalysis.relationship === "family") {
        // Family context: warm tones + appropriate gen-z
        tonesToGenerate = ["casual", "friendly", "genz", "empathetic"];
      } else {
        // General/neutral: balanced tones + gen-z
        tonesToGenerate = ["professional", "friendly", "casual", "genz", "empathetic"];
      }
      
      // Add confident tone for urgent/assertive situations
      if (detectedAnalysis.emotion === "urgent" || detectedAnalysis.emotion === "negative") {
        tonesToGenerate.push("confident");
      }

      // Prepare context for AI with relationship-specific gen-z guidance
      let context = `Reply to a message from ${detectedAnalysis.relationship}. Original message emotion: ${detectedAnalysis.emotion}, intent: ${detectedAnalysis.intent}. When generating gen-z tone, tailor it appropriately for ${detectedAnalysis.relationship} relationship - use trendy language while maintaining respect level suitable for this relationship`;
      
      // Add user-provided additional context if available
      if (additionalContext.trim()) {
        context += `. Additional context: ${additionalContext.trim()}`;
      }
      
      // Call Groq AI for each tone (parallel requests)
      toast.info("Generating AI-powered replies...");
      
      const promises = tonesToGenerate.map(tone =>
        toneAPI.quickShift({
          text: input,
          target_tone: tone,
          context: context,
          temperature: 0.7,
        }).catch(error => {
          console.error(`Failed to generate ${tone} tone:`, error);
          return null;
        })
      );
      
      const results = await Promise.all(promises);
      
      // Filter out failed requests and map to Response format
      const newResponses: Response[] = results
        .filter((result): result is NonNullable<typeof result> => result !== null && result.success)
        .map((result, index) => ({
          style: result.target_tone.charAt(0).toUpperCase() + result.target_tone.slice(1),
          content: result.transformed_text,
          color: getColorForTone(result.target_tone),
          sentiment: getSentimentForTone(result.target_tone),
          isRecommended: index === 0, // First one is recommended
          emojis: getEmojisForTone(result.target_tone),
          gifSuggestion: `${result.target_tone}-gesture`,
          cached: result.cached,
          cacheHitCount: result.cache_hit_count,
        }));
      
      if (newResponses.length === 0) {
        toast.error("Failed to generate replies. Please try again.");
        // Fallback to mock data if all API calls fail
        const mockResponses = mockGenerate(detectedAnalysis);
        setResponses(mockResponses);
      } else {
        // Fetch GIFs for each response based on tone
        toast.info("🎬 Loading GIF suggestions...");
        
        const responsesWithGifs = await Promise.all(
          newResponses.map(async (response) => {
            try {
              const tone = response.style.toLowerCase();
              console.log(`[GIF] Fetching GIFs for style: "${response.style}" → tone: "${tone}"`);
              const gifs = await searchGifsByTone(tone, 5);
              console.log(`[GIF] Fetched ${gifs.length} GIFs for tone: "${tone}"`);
              return { ...response, gifs };
            } catch (error) {
              console.error('Error fetching GIFs for response:', error);
              return response;
            }
          })
        );
        
        setResponses(responsesWithGifs);
        setCurrentResponseIndex(0); // Reset to first response
        
        const totalGifs = responsesWithGifs.reduce((sum, r) => sum + (r.gifs?.length || 0), 0);
        console.log(`[GIF] Total GIFs fetched: ${totalGifs}`);
        toast.success(`✨ Generated ${newResponses.length} AI-powered replies with ${totalGifs} GIF suggestions!`);
      }
      
    } catch (error) {
      console.error("Error generating responses:", error);
      toast.error("Failed to generate replies. Using fallback suggestions.");
      
      // Fallback to mock data on error
      const detectedAnalysis = analyzeMessage(input);
      const mockResponses = mockGenerate(detectedAnalysis);
      setResponses(mockResponses);
      setCurrentResponseIndex(0);
    } finally {
      setIsGenerating(false);
    }
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

                {/* Additional Context Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-purple-400" />
                    Additional Context (Optional)
                  </label>
                  <Textarea
                    placeholder="Add context for better replies (e.g., 'This is about a project deadline', 'We discussed this last week', 'They helped me before')..."
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                    className="min-h-[100px] resize-none bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  />
                  <p className="text-xs text-gray-500">
                    💡 Tip: Adding context helps AI generate more accurate and relevant replies
                  </p>
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
                  {additionalContext.trim() && (
                    <div className="mt-2 p-3 bg-blue-900/30 border border-blue-700 rounded-md">
                      <p className="text-sm text-blue-300">
                        <strong>Additional Context Used:</strong> "{additionalContext.trim()}"
                      </p>
                    </div>
                  )}
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
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">Suggested Replies</h2>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-purple-900/50 text-purple-300">
                      {currentResponseIndex + 1} / {responses.length}
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handlePreviousResponse}
                        className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                        disabled={responses.length <= 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleNextResponse}
                        className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                        disabled={responses.length <= 1}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Single Response Card with Navigation */}
                <ResponseCard
                  key={currentResponseIndex}
                  title={responses[currentResponseIndex].style}
                  content={responses[currentResponseIndex].content}
                  color={responses[currentResponseIndex].color}
                  sentiment={responses[currentResponseIndex].sentiment}
                  isRecommended={responses[currentResponseIndex].isRecommended}
                  index={currentResponseIndex}
                  emojis={responses[currentResponseIndex].emojis}
                  gifs={responses[currentResponseIndex].gifs}
                  gifSuggestion={responses[currentResponseIndex].gifSuggestion}
                  cached={responses[currentResponseIndex].cached}
                  cacheHitCount={responses[currentResponseIndex].cacheHitCount}
                />

                {/* Quick Navigation Dots */}
                <div className="flex justify-center gap-2 mt-4">
                  {responses.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentResponseIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentResponseIndex
                          ? "bg-purple-500 w-8"
                          : "bg-gray-600 hover:bg-gray-500"
                      }`}
                      aria-label={`Go to response ${index + 1}`}
                    />
                  ))}
                </div>

                {/* View All Button */}
                <Button
                  variant="outline"
                  className="w-full bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                  onClick={() => {
                    // You can add a modal or expand view here
                    toast.info("Showing all responses");
                  }}
                >
                  View All {responses.length} Suggestions
                </Button>
              </>
            )}

            {/* Sample Prompts - Always visible in right column */}
            <Card className="shadow-soft animate-fade-in bg-gray-900 border-gray-800" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle className="text-lg text-white">Try These Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { msg: "Thanks for the invitation to the meeting", ctx: "We discussed the project timeline last week" },
                  { msg: "I need to reschedule our appointment", ctx: "I have a conflicting deadline on Friday" },
                  { msg: "Congratulations on your promotion!", ctx: "They've been working hard on the Smith project" },
                  { msg: "Sorry for the delay in responding", ctx: "I was out of office due to a family emergency" },
                ].map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInput(example.msg);
                      setAdditionalContext(example.ctx);
                    }}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-800 transition-colors text-sm"
                  >
                    <p className="text-gray-300">"{example.msg}"</p>
                    <p className="text-xs text-gray-500 mt-1">+ Context: {example.ctx}</p>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
