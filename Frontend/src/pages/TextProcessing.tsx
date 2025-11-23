import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Globe, AlertCircle, Languages, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import InputSection from "@/components/dashboard/InputSection";
import ResponseCard from "@/components/dashboard/ResponseCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { textAPI } from "@/lib/api";
import { searchGifsByTone, TenorGif } from "@/lib/tenor";

interface ProcessedResult {
  type: string;
  content: string;
  color: string;
  emojis?: string[];
  gifs?: TenorGif[];
  cached?: boolean;
  cacheHitCount?: number;
}

interface CulturalNote {
  language: string;
  note: string;
  greetings: string[];
}

const TextProcessing = () => {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<ProcessedResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [culturalNote, setCulturalNote] = useState<CulturalNote | null>(null);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  
  // Feature toggles
  const [grammarCorrection, setGrammarCorrection] = useState(true);
  const [rephrasing, setRephrasing] = useState(true);
  const [translation, setTranslation] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState("es");

  // Navigation handlers
  const handlePreviousResult = () => {
    setCurrentResultIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
  };

  const handleNextResult = () => {
    setCurrentResultIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (results.length <= 1) return;
      
      if (e.key === "ArrowLeft") {
        handlePreviousResult();
      } else if (e.key === "ArrowRight") {
        handleNextResult();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [results.length]);

  // Reset current index when results change
  useEffect(() => {
    setCurrentResultIndex(0);
  }, [results]);

  const getCulturalNotes = (lang: string): CulturalNote => {
    const notes: Record<string, CulturalNote> = {
      es: {
        language: "Spanish",
        note: "In Spanish-speaking cultures, formal address (usted) is common in professional settings. Greetings and small talk are valued.",
        greetings: ["Buenos días", "Buenas tardes", "Mucho gusto"]
      },
      fr: {
        language: "French",
        note: "French culture values formal greetings. Use 'vous' for formal situations. Politeness phrases like 's'il vous plaît' are essential.",
        greetings: ["Bonjour", "Bonsoir", "Enchanté(e)"]
      },
      de: {
        language: "German",
        note: "Germans appreciate direct communication and punctuality. Use 'Sie' for formal address until invited to use 'du'.",
        greetings: ["Guten Tag", "Guten Morgen", "Sehr erfreut"]
      },
      ja: {
        language: "Japanese",
        note: "Japanese culture emphasizes respect and formality. Use appropriate honorifics (-san, -sama). Avoid direct confrontation.",
        greetings: ["こんにちは (Konnichiwa)", "おはようございます (Ohayō gozaimasu)", "よろしくお願いします (Yoroshiku onegaishimasu)"]
      },
      zh: {
        language: "Chinese",
        note: "Chinese culture values harmony and face-saving. Indirect communication is common. Respect for hierarchy is important.",
        greetings: ["你好 (Nǐ hǎo)", "早上好 (Zǎoshang hǎo)", "很高兴见到你 (Hěn gāoxìng jiàn dào nǐ)"]
      },
      ko: {
        language: "Korean",
        note: "Korean culture emphasizes respect for elders and hierarchy. Use appropriate speech levels (formal/informal).",
        greetings: ["안녕하세요 (Annyeonghaseyo)", "반갑습니다 (Bangapseumnida)"]
      },
    };
    return notes[lang] || {
      language: "Target",
      note: "Be mindful of cultural differences in communication styles and etiquette.",
      greetings: []
    };
  };

  const mockProcess = () => {
    const processedResults: ProcessedResult[] = [];

    if (grammarCorrection) {
      processedResults.push({
        type: "Grammar Corrected",
        content: input.replace(/\bi\b/g, "I").replace(/\bu\b/g, "you").replace(/\bur\b/g, "your") + " (grammar & spelling corrected)",
        color: "bg-blue-100 text-blue-900 border-blue-200",
        emojis: ["✅", "📝", "✏️"]
      });
    }

    if (rephrasing) {
      processedResults.push(
        {
          type: "Formal Style",
          content: "I would like to express the following: " + input + ". I trust this clarifies the matter appropriately.",
          color: "bg-indigo-100 text-indigo-900 border-indigo-200",
          emojis: ["👔", "💼"]
        },
        {
          type: "Casual Style",
          content: "Hey! So basically, " + input + ". Hope that makes sense!",
          color: "bg-green-100 text-green-900 border-green-200",
          emojis: ["😊", "👍"]
        },
        {
          type: "Concise Version",
          content: input.split(" ").slice(0, 10).join(" ") + "...",
          color: "bg-purple-100 text-purple-900 border-purple-200",
          emojis: ["⚡", "🎯"]
        },
        {
          type: "Expanded Version",
          content: input + " This provides additional context and detail to ensure clarity, comprehension, and completeness of the message being conveyed.",
          color: "bg-orange-100 text-orange-900 border-orange-200",
          emojis: ["📚", "📖"]
        }
      );
    }

    if (translation) {
      const translations: Record<string, string> = {
        es: "Aquí está tu mensaje traducido al español. Este es un ejemplo de traducción cultural y lingüísticamente apropiada.",
        fr: "Voici votre message traduit en français. Ceci est un exemple de traduction culturellement et linguistiquement appropriée.",
        de: "Hier ist Ihre Nachricht auf Deutsch übersetzt. Dies ist ein Beispiel für eine kulturell und sprachlich angemessene Übersetzung.",
        it: "Ecco il tuo messaggio tradotto in italiano. Questo è un esempio di traduzione culturalmente e linguisticamente appropriata.",
        pt: "Aqui está sua mensagem traduzida para português. Este é um exemplo de tradução cultural e linguisticamente apropriada.",
        ja: "これはあなたのメッセージの日本語訳です。これは文化的および言語的に適切な翻訳の例です。",
        ko: "한국어로 번역된 메시지입니다. 이것은 문화적 및 언어적으로 적절한 번역의 예입니다.",
        zh: "这是你的消息翻译成中文。这是文化和语言上适当翻译的例子。",
      };
      processedResults.push({
        type: `Translated (${targetLanguage.toUpperCase()})`,
        content: translations[targetLanguage] || "Translation coming soon",
        color: "bg-pink-100 text-pink-900 border-pink-200",
        emojis: ["🌍", "🗣️", "💬"]
      });
      
      // Set cultural note
      setCulturalNote(getCulturalNotes(targetLanguage));
    }

    return processedResults;
  };

  // Helper function to get color for tone/style
  const getColorForStyle = (style: string): string => {
    const colorMap: Record<string, string> = {
      grammar: "bg-blue-100 text-blue-900 border-blue-200",
      professional: "bg-indigo-100 text-indigo-900 border-indigo-200",
      formal: "bg-indigo-100 text-indigo-900 border-indigo-200",
      casual: "bg-green-100 text-green-900 border-green-200",
      genz: "bg-pink-100 text-pink-900 border-pink-200",
      concise: "bg-purple-100 text-purple-900 border-purple-200",
      detailed: "bg-orange-100 text-orange-900 border-orange-200",
      translation: "bg-pink-100 text-pink-900 border-pink-200",
    };
    return colorMap[style] || "bg-gray-100 text-gray-900 border-gray-200";
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
    setCulturalNote(null); // Reset cultural note
    
    try {
      const processedResults: ProcessedResult[] = [];

      // Use the new textAPI for rewriting
      if (rephrasing) {
        toast.info("✨ Generating AI-powered style variations...");
        
        const tones = ["formal", "casual", "genz", "concise", "detailed"];
        
        try {
          const result = await textAPI.rewriteMultiple({
            text: input,
            tones: tones,
            use_cache: true
          });

          if (result.success) {
            result.variations.forEach(variation => {
              const label = 
                variation.tone === "formal" ? "Formal Style" :
                variation.tone === "casual" ? "Casual Style" :
                variation.tone === "genz" ? "Gen-Z Style" :
                variation.tone === "concise" ? "Concise Version" : "Expanded Version";
              
              const emojis = 
                variation.tone === "formal" ? ["👔", "💼"] :
                variation.tone === "casual" ? ["😊", "👍"] :
                variation.tone === "genz" ? ["💯", "🔥", "✨"] :
                variation.tone === "concise" ? ["⚡", "🎯"] : ["📚", "📖"];

              processedResults.push({
                type: label,
                content: variation.rewritten,
                color: getColorForStyle(variation.tone),
                emojis: emojis,
                cached: variation.cached,
                cacheHitCount: variation.cache_hit_count
              });
            });

            if (result.variations.some(v => v.cached)) {
              toast.success("⚡ Some results loaded from cache!");
            }
          }
        } catch (error) {
          console.error("AI rewrite failed:", error);
          toast.error("Failed to generate variations");
        }
      }

      // Grammar Correction (using single tone rewrite)
      if (grammarCorrection) {
        toast.info("📝 Correcting grammar with AI...");
        
        try {
          const result = await textAPI.rewrite({
            text: input,
            tone: "neutral",
            use_cache: true
          });

          if (result.success) {
            processedResults.unshift({ // Add at beginning
              type: "Grammar & Spelling Corrected",
              content: result.rewritten,
              color: getColorForStyle("grammar"),
              emojis: ["✅", "�", "✏️"],
              cached: result.cached,
              cacheHitCount: result.cache_hit_count
            });

            if (result.cached) {
              toast.success("⚡ Grammar correction loaded from cache!");
            }
          }
        } catch (error) {
          console.error("Grammar correction failed:", error);
          // Fallback to basic correction
          processedResults.unshift({
            type: "Grammar Corrected (Basic)",
            content: input.replace(/\bi\b/g, "I").replace(/\bu\b/g, "you").replace(/\bur\b/g, "your"),
            color: getColorForStyle("grammar"),
            emojis: ["✅", "📝"]
          });
        }
      }

      // Translation (still using mock for now - can be replaced with translation API)
      if (translation) {
        const translations: Record<string, string> = {
          es: "Aquí está tu mensaje traducido al español. Este es un ejemplo de traducción cultural y lingüísticamente apropiada.",
          fr: "Voici votre message traduit en français. Ceci est un exemple de traduction culturellement et linguistiquement appropriée.",
          de: "Hier ist Ihre Nachricht auf Deutsch übersetzt. Dies ist ein Beispiel für eine kulturell und sprachlich angemessene Übersetzung.",
          it: "Ecco il tuo messaggio tradotto in italiano. Questo è un esempio di traduzione culturalmente e linguisticamente appropriata.",
          pt: "Aqui está sua mensagem traduzida para português. Este é um exemplo de tradução cultural e linguisticamente apropriada.",
          ja: "これはあなたのメッセージの日本語訳です。これは文化的および言語的に適切な翻訳の例です。",
          ko: "한국어로 번역된 메시지입니다. 이것은 문화적 및 언어적으로 적절한 번역의 예입니다.",
          zh: "这是你的消息翻译成中文。这是文化和语言上适当翻译的例子。",
        };
        
        processedResults.push({
          type: `Translated (${targetLanguage.toUpperCase()})`,
          content: translations[targetLanguage] || "Translation coming soon",
          color: getColorForStyle("translation"),
          emojis: ["🌍", "🗣️", "💬"]
        });
        
        // Set cultural note
        setCulturalNote(getCulturalNotes(targetLanguage));
      }

      if (processedResults.length === 0) {
        toast.error("No results generated. Please try again.");
        // Fallback to mock data
        const mockResults = mockProcess();
        setResults(mockResults);
      } else {
        // Fetch GIFs for each result based on tone
        toast.info("🎬 Loading GIF suggestions...");
        
        const resultsWithGifs = await Promise.all(
          processedResults.map(async (result) => {
            try {
              // Extract tone from result type
              let tone = 'casual';
              if (result.type.includes('Formal')) tone = 'formal';
              else if (result.type.includes('Casual')) tone = 'casual';
              else if (result.type.includes('Gen-Z')) tone = 'genz';
              else if (result.type.includes('Concise')) tone = 'concise';
              else if (result.type.includes('Expanded') || result.type.includes('Detailed')) tone = 'detailed';
              else if (result.type.includes('Grammar')) tone = 'grammar';
              else if (result.type.includes('Translated')) tone = 'translation';
              
              console.log(`[GIF] Fetching GIFs for type: "${result.type}" → tone: "${tone}"`);
              const gifs = await searchGifsByTone(tone, 5);
              console.log(`[GIF] Fetched ${gifs.length} GIFs for tone: "${tone}"`);
              return { ...result, gifs };
            } catch (error) {
              console.error('Error fetching GIFs for result:', error);
              return result;
            }
          })
        );
        
        setResults(resultsWithGifs);
        
        const totalGifs = resultsWithGifs.reduce((sum, r) => sum + (r.gifs?.length || 0), 0);
        console.log(`[GIF] Total GIFs fetched: ${totalGifs}`);
        toast.success(`✨ Generated ${processedResults.length} variations with ${totalGifs} GIF suggestions!`);
      }
      
    } catch (error) {
      console.error("Error processing text:", error);
      toast.error("Processing failed. Using fallback processing.");
      
      // Fallback to mock data on error
      const mockResults = mockProcess();
      setResults(mockResults);
    } finally {
      setIsProcessing(false);
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
                <h1 className="text-2xl font-bold text-white">Text Processing</h1>
                <p className="text-sm text-gray-400 mt-1">Grammar correction, translation & style transformation</p>
              </div>
            </div>
          </div>
        </header>

        <div className="px-8 py-8 max-w-7xl mx-auto">
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
            {/* Cultural Sensitivity Note */}
            {culturalNote && (
              <Card className="bg-gray-900 border-amber-500/50 animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-white">
                    <Globe className="w-5 h-5 text-amber-500" />
                    Cultural Sensitivity - {culturalNote.language}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-200">{culturalNote.note}</p>
                  </div>
                  {culturalNote.greetings.length > 0 && (
                    <div className="mt-3 p-3 bg-gray-800/50 rounded-md border border-gray-700">
                      <p className="text-sm font-medium text-amber-300 mb-2 flex items-center gap-1">
                        <Languages className="w-4 h-4" />
                        Common Greetings:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {culturalNote.greetings.map((greeting, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs bg-gray-800 text-white border-gray-700">
                            {greeting}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">No results yet</h3>
                <p className="text-gray-400 max-w-sm">
                  Enter your text, select processing features, and click "Process Text"
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">Processed Results</h2>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-purple-900/50 text-purple-300">
                      {currentResultIndex + 1} / {results.length}
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handlePreviousResult}
                        className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                        disabled={results.length <= 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleNextResult}
                        className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                        disabled={results.length <= 1}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Single Result Card with Navigation */}
                <ResponseCard
                  key={currentResultIndex}
                  title={results[currentResultIndex].type}
                  content={results[currentResultIndex].content}
                  color={results[currentResultIndex].color}
                  index={currentResultIndex}
                  emojis={results[currentResultIndex].emojis}
                  gifs={results[currentResultIndex].gifs}
                  cached={results[currentResultIndex].cached}
                  cacheHitCount={results[currentResultIndex].cacheHitCount}
                />

                {/* Quick Navigation Dots */}
                <div className="flex justify-center gap-2 mt-4">
                  {results.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentResultIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentResultIndex
                          ? "bg-purple-500 w-8"
                          : "bg-gray-600 hover:bg-gray-500"
                      }`}
                      aria-label={`Go to result ${index + 1}`}
                    />
                  ))}
                </div>

                {/* View All Button */}
                <Button
                  variant="outline"
                  className="w-full bg-gray-800 border-gray-700 hover:bg-gray-700 text-white mt-4"
                  onClick={() => {
                    toast.info(`Showing all ${results.length} variations`);
                  }}
                >
                  View All {results.length} Variations
                </Button>
              </>
            )}
          </div>
        </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TextProcessing;
