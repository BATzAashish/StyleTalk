import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Send, ThumbsUp, ThumbsDown, Image } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ResponseCardProps {
  title: string;
  content: string;
  color: string;
  sentiment?: string;
  isRecommended?: boolean;
  index: number;
  emojis?: string[];
  gifSuggestion?: string;
}

const ResponseCard = ({ 
  title, 
  content, 
  color, 
  sentiment, 
  isRecommended, 
  index, 
  emojis, 
  gifSuggestion 
}: ResponseCardProps) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

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

  return (
    <Card 
      className={`shadow-medium hover:shadow-glow transition-all duration-300 animate-slide-up border-2 ${color}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{title}</CardTitle>
            {isRecommended && (
              <Badge variant="default" className="text-xs">✨ Recommended</Badge>
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
            {gifSuggestion && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Suggested GIF:</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => toast.info("GIF search coming soon!")}
                >
                  <Image className="w-4 h-4 mr-2" />
                  Search "{gifSuggestion}" GIF
                </Button>
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
