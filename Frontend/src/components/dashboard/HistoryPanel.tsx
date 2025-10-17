import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { History, Trash2 } from "lucide-react";

interface HistoryItem {
  id: string;
  input: string;
  timestamp: Date;
  chosenStyle: string;
}

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

const HistoryPanel = ({ history, onSelectHistory, onClearHistory }: HistoryPanelProps) => {
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="w-5 h-5" />
            Recent History
          </CardTitle>
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearHistory}
              className="text-muted-foreground"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No history yet. Start generating responses!
          </p>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelectHistory(item)}
                  className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors border border-border"
                >
                  <p className="text-sm line-clamp-2 mb-1">{item.input}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{item.chosenStyle}</span>
                    <span>{item.timestamp.toLocaleDateString()}</span>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoryPanel;
