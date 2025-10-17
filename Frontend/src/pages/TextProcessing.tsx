import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MessageSquare, Settings } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import InputSection from "@/components/dashboard/InputSection";
import ResponseCard from "@/components/dashboard/ResponseCard";

interface ProcessedResult {
  type: string;
  content: string;
  color: string;
}

const TextProcessing = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [results, setResults] = useState<ProcessedResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Feature toggles
  const [grammarCorrection, setGrammarCorrection] = useState(true);
  const [rephrasing, setRephrasing] = useState(true);
  const [translation, setTranslation] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState("es");

  const mockProcess = () => {
    const processedResults: ProcessedResult[] = [];

    if (grammarCorrection) {
      processedResults.push({
        type: "Grammar Corrected",
        content: input.replace(/\bi\b/g, "I").replace(/\bu\b/g, "you") + " (corrected)",
        color: "bg-blue-100 text-blue-900 border-blue-200",
      });
    }

    if (rephrasing) {
      processedResults.push(
        {
          type: "Concise Version",
          content: input.split(" ").slice(0, 10).join(" ") + "...",
          color: "bg-green-100 text-green-900 border-green-200",
        },
        {
          type: "Expanded Version",
          content: input + " This provides additional context and detail to ensure clarity and completeness.",
          color: "bg-purple-100 text-purple-900 border-purple-200",
        },
        {
          type: "Paraphrased",
          content: "Here's an alternative way to express the same idea: " + input,
          color: "bg-orange-100 text-orange-900 border-orange-200",
        }
      );
    }

    if (translation) {
      const translations: Record<string, string> = {
        es: "Aquí está tu mensaje traducido al español",
        fr: "Voici votre message traduit en français",
        de: "Hier ist Ihre Nachricht auf Deutsch übersetzt",
        it: "Ecco il tuo messaggio tradotto in italiano",
        pt: "Aqui está sua mensagem traduzida para português",
        ja: "これはあなたのメッセージの日本語訳です",
        ko: "한국어로 번역된 메시지입니다",
        zh: "这是你的消息翻译成中文",
      };
      processedResults.push({
        type: `Translated (${targetLanguage.toUpperCase()})`,
        content: translations[targetLanguage] || "Translation coming soon",
        color: "bg-pink-100 text-pink-900 border-pink-200",
      });
    }

    return processedResults;
  };

  const handleProcess = async () => {
    if (!input.trim()) {
      toast.error("Please enter text to process");
      return;
    }

    if (!grammarCorrection && !rephrasing && !translation) {
      toast.error("Please enable at least one processing feature");
      return;
    }

    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      const newResults = mockProcess();
      setResults(newResults);
      setIsProcessing(false);
      toast.success("Text processed successfully!");
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
              <Link to="/dashboard">
                <MessageSquare className="w-4 h-4 mr-2" />
                Reply Suggestions
              </Link>
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
            <InputSection
              input={input}
              onInputChange={setInput}
              grammarCorrection={grammarCorrection}
              onGrammarCorrectionChange={setGrammarCorrection}
              rephrasing={rephrasing}
              onRephrasingChange={setRephrasing}
              translation={translation}
              onTranslationChange={setTranslation}
              targetLanguage={targetLanguage}
              onTargetLanguageChange={setTargetLanguage}
            />

            <Button 
              onClick={handleProcess} 
              variant="hero" 
              size="lg" 
              className="w-full"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Processing Text...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Process Text
                </>
              )}
            </Button>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No results yet</h3>
                <p className="text-muted-foreground max-w-sm">
                  Enter your text, select processing features, and click "Process Text"
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Processed Results</h2>
                  <Badge variant="secondary">
                    {results.length} version{results.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                
                {results.map((result, index) => (
                  <ResponseCard
                    key={index}
                    title={result.type}
                    content={result.content}
                    color={result.color}
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

export default TextProcessing;
