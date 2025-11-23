import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Send, ThumbsUp, ThumbsDown, Image, Database, Zap, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { TenorGif } from "@/lib/tenor";

interface ResponseCardProps {
  title: string;
  content: string;
  color: string;
  sentiment?: string;
  isRecommended?: boolean;
  index: number;
  emojis?: string[];
  gifs?: TenorGif[];
  gifSuggestion?: string;
  cached?: boolean;
  cacheHitCount?: number;
}

const ResponseCard = ({ 
  title, 
  content, 
  color, 
  sentiment, 
  isRecommended, 
  index, 
  emojis,
  gifs,
  gifSuggestion,
  cached,
  cacheHitCount 
}: ResponseCardProps) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [showGifs, setShowGifs] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    toast.success("Export feature coming soon!");
  };

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(type);
    toast.success(type === 'up' ? "Thanks for the positive feedback!" : "Thanks for the feedback! We'll improve.");
  };

  const handleCopyEmoji = (emoji: string) => {
    navigator.clipboard.writeText(emoji);
    toast.success(`Copied ${emoji} to clipboard!`);
  };

  const handleCopyGif = (gifUrl: string) => {
    navigator.clipboard.writeText(gifUrl);
    toast.success("GIF URL copied to clipboard!");
  };

  // Debug logging
  console.log(`[ResponseCard] ${title} - GIFs available:`, gifs?.length || 0);

  return (
    <Card 
      className={`shadow-medium hover:shadow-glow transition-all duration-300 animate-slide-up border-2 ${color}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-lg">{title}</CardTitle>
            {isRecommended && (
              <Badge variant="default" className="text-xs">✨ Recommended</Badge>
            )}
            {cached && (
              <Badge 
                variant="secondary" 
                className="text-xs gap-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                title={`Loaded from cache${cacheHitCount ? ` (used ${cacheHitCount} times)` : ''}`}
              >
                <Zap className="w-3 h-3" />
                Instant
                {cacheHitCount && cacheHitCount > 1 && (
                  <span className="ml-1 text-[10px] opacity-75">×{cacheHitCount}</span>
                )}
              </Badge>
            )}
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleCopy}
              className="hover:bg-background/80"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleExport}
              className="hover:bg-background/80"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {sentiment && (
          <Badge variant="outline" className="w-fit text-xs">
            Tone: {sentiment}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-base leading-relaxed">{content}</p>
        
        {/* Multi-Modal Suggestions */}
        {(emojis || gifSuggestion) && (
          <div className="pt-3 border-t space-y-3">
            {emojis && emojis.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Suggested Emojis:</p>
                <div className="flex gap-2 flex-wrap">
                  {emojis.map((emoji, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleCopyEmoji(emoji)}
                      className="text-2xl hover:scale-125 transition-transform cursor-pointer"
                      title="Click to copy"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {gifs && gifs.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Image className="w-3 h-3" />
                    Suggested GIFs ({gifs.length})
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowGifs(!showGifs)}
                    className="h-6 text-xs"
                  >
                    {showGifs ? 'Hide' : 'Show'}
                  </Button>
                </div>
                
                {showGifs && (
                  <div className="grid grid-cols-2 gap-2">
                    {gifs.slice(0, 4).map((gif) => (
                      <div 
                        key={gif.id}
                        className="relative group overflow-hidden rounded-lg border-2 border-gray-200 hover:border-primary transition-all cursor-pointer"
                        onClick={() => handleCopyGif(gif.url)}
                        title={`Click to copy: ${gif.title}`}
                      >
                        <img 
                          src={gif.preview} 
                          alt={gif.title}
                          className="w-full h-24 object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Copy className="w-5 h-5 text-white" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1">
                          <p className="text-[10px] text-white truncate">{gif.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span>Powered by</span>
                  <a 
                    href="https://tenor.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-0.5"
                  >
                    Tenor
                    <ExternalLink className="w-2 h-2" />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Feedback Section */}
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Was this helpful?</p>
            <div className="flex gap-1">
              <Button
                variant={feedback === 'up' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleFeedback('up')}
                className="h-8"
              >
                <ThumbsUp className="w-3 h-3 mr-1" />
                {feedback === 'up' && 'Thanks!'}
              </Button>
              <Button
                variant={feedback === 'down' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleFeedback('down')}
                className="h-8"
              >
                <ThumbsDown className="w-3 h-3 mr-1" />
                {feedback === 'down' && 'Noted'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResponseCard;
