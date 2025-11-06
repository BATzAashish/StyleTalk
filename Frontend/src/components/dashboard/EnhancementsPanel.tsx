import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Smile, Lightbulb } from "lucide-react";

interface EnhancementsPanelProps {
  detectedSentiment: string;
  suggestedEmojis: string[];
}

const EnhancementsPanel = ({ detectedSentiment, suggestedEmojis }: EnhancementsPanelProps) => {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-white">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          Enhancements & Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold mb-2 text-white">Detected Sentiment</h4>
          <Badge variant="secondary" className="text-sm bg-gray-800 text-white border-gray-700">
            {detectedSentiment}
          </Badge>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-white">
            <Smile className="w-4 h-4 text-yellow-500" />
            Suggested Emojis
          </h4>
          <div className="flex gap-2 flex-wrap">
            {suggestedEmojis.map((emoji, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                className="text-xl h-10 w-10 p-0 bg-gray-800 border-gray-700 hover:bg-gray-700"
                onClick={() => navigator.clipboard.writeText(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancementsPanel;
