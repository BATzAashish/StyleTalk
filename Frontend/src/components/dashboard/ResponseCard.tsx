import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ResponseCardProps {
  title: string;
  content: string;
  color: string;
  sentiment?: string;
  isRecommended?: boolean;
  index: number;
}

const ResponseCard = ({ title, content, color, sentiment, isRecommended, index }: ResponseCardProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    toast.success("Export feature coming soon!");
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
              <Badge variant="default" className="text-xs">Recommended</Badge>
            )}
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleExport}>
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
      <CardContent>
        <p className="text-base leading-relaxed">{content}</p>
      </CardContent>
    </Card>
  );
};

export default ResponseCard;
