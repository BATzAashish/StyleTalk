import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, History, Settings, FileText } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import ResponseCard from "@/components/dashboard/ResponseCard";

interface Response {
  style: string;
  content: string;
  color: string;
  sentiment?: string;
  isRecommended?: boolean;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [responses, setResponses] = useState<Response[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const mockGenerate = () => {
    const styles: Response[] = [
      {
        style: "Formal",
        content: "I appreciate your message. I would be delighted to discuss this matter further at your earliest convenience.",
        color: "bg-blue-100 text-blue-900 border-blue-200",
        sentiment: "Professional",
        isRecommended: true,
      },
      {
        style: "Casual",
        content: "Hey! Thanks for reaching out. I'd love to chat about this when you're free!",
        color: "bg-green-100 text-green-900 border-green-200",
        sentiment: "Friendly",
      },
      {
        style: "Witty",
        content: "Well, well, well... look who decided to grace my inbox! 😏 Let's make this conversation legendary.",
        color: "bg-purple-100 text-purple-900 border-purple-200",
        sentiment: "Humorous",
      },
      {
        style: "Gen-Z",
        content: "omg hi!! 💕 lowkey so excited to talk about this fr fr no cap 🔥",
        color: "bg-pink-100 text-pink-900 border-pink-200",
        sentiment: "Enthusiastic",
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
      const newResponses = mockGenerate();
      setResponses(newResponses);
      setIsGenerating(false);
      toast.success("Reply suggestions generated!");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">StyleTalk AI</h1>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/text-processing">
                <FileText className="w-4 h-4 mr-2" />
                Text Processing
              </Link>
            </Button>
            <Button variant="ghost" size="icon">
              <History className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate("/onboarding")}>
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="shadow-medium animate-fade-in">
              <CardHeader>
                <CardTitle>Comment/Message You Received</CardTitle>
                <CardDescription>
                  Paste a comment or message you received, and we'll suggest multiple reply styles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste the comment or message you want to reply to..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
                <Button 
                  onClick={handleGenerate} 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Generating Reply Suggestions...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Reply Suggestions
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Sample Prompts */}
            <Card className="shadow-soft animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle className="text-lg">Try These Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  "Thanks for the invitation to the meeting",
                  "I need to reschedule our appointment",
                  "Congratulations on your promotion!",
                ].map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(example)}
                    className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors text-sm"
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
              <Card className="shadow-soft animate-fade-in">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No suggestions yet</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Enter a comment and click "Generate Reply Suggestions" to see multiple styled responses
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Suggested Replies</h2>
                  <Badge variant="secondary">
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
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
