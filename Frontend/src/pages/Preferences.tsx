import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Copy, ThumbsUp, Download } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

interface HistoryItem {
  id: number;
  input: string;
  output: string;
  style: string;
  timestamp: string;
  liked: boolean;
}

const Preferences = () => {
  const [autoDetect, setAutoDetect] = useState(true);
  const [showEmojis, setShowEmojis] = useState(true);
  const [showGifs, setShowGifs] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [defaultStyle, setDefaultStyle] = useState("auto");
  const [defaultLanguage, setDefaultLanguage] = useState("en");

  // Mock history data
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      id: 1,
      input: "Thanks for the meeting invitation!",
      output: "Thank you so much for inviting me to the meeting! I truly appreciate the opportunity to contribute.",
      style: "Formal",
      timestamp: "2024-03-15 10:30 AM",
      liked: true,
    },
    {
      id: 2,
      input: "Let's catch up soon",
      output: "Yo! We should totally hang out soon, it's been forever! 🎉",
      style: "Gen-Z",
      timestamp: "2024-03-14 03:15 PM",
      liked: false,
    },
    {
      id: 3,
      input: "Can we reschedule?",
      output: "Hi! Would it be possible to reschedule our meeting? I understand if this is inconvenient.",
      style: "Polite",
      timestamp: "2024-03-13 09:00 AM",
      liked: true,
    },
  ]);

  const handleSavePreferences = () => {
    toast.success("Preferences saved successfully!");
  };

  const handleClearHistory = () => {
    toast.success("History cleared!");
  };

  const handleCopyHistoryItem = (output: string) => {
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard!");
  };

  const handleExportHistory = () => {
    toast.info("Export feature coming soon!");
  };

  return (
    <DashboardLayout>
      <div className="flex-1 w-full bg-black overflow-y-auto">
        <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Settings & History</h1>
                <p className="text-sm text-gray-400 mt-1">Manage your preferences and view conversation history</p>
              </div>
            </div>
          </div>
        </header>

        <div className="px-8 py-8 max-w-5xl mx-auto">
          <Tabs defaultValue="preferences" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-900 border-gray-800">
              <TabsTrigger value="preferences" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Preferences</TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">History</TabsTrigger>
            </TabsList>

            <TabsContent value="preferences" className="space-y-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">AI Behavior</CardTitle>
                  <CardDescription className="text-gray-400">
                    Configure how StyleTalk AI analyzes and suggests responses
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-detect" className="text-white">Auto-detect Context</Label>
                      <p className="text-sm text-gray-400">
                        Automatically analyze emotion, intent, and relationship
                      </p>
                    </div>
                    <Switch
                      id="auto-detect"
                      checked={autoDetect}
                      onCheckedChange={setAutoDetect}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="show-emojis" className="text-white">Show Emoji Suggestions</Label>
                      <p className="text-sm text-gray-400">
                        Display relevant emoji recommendations with replies
                      </p>
                    </div>
                    <Switch
                      id="show-emojis"
                      checked={showEmojis}
                      onCheckedChange={setShowEmojis}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="show-gifs" className="text-white">Show GIF Suggestions</Label>
                      <p className="text-sm text-gray-400">
                        Include GIF recommendations for casual conversations
                      </p>
                    </div>
                    <Switch
                      id="show-gifs"
                      checked={showGifs}
                      onCheckedChange={setShowGifs}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="privacy-mode" className="text-white">Privacy Mode</Label>
                      <p className="text-sm text-gray-400">
                        Don't save conversation history
                      </p>
                    </div>
                    <Switch
                      id="privacy-mode"
                      checked={privacyMode}
                      onCheckedChange={setPrivacyMode}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Default Settings</CardTitle>
                  <CardDescription className="text-gray-400">
                    Set your preferred defaults for new conversations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="default-style" className="text-white">Default Tone Style</Label>
                    <Select value={defaultStyle} onValueChange={setDefaultStyle}>
                      <SelectTrigger id="default-style" className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Select default style" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="auto" className="text-white hover:bg-gray-700">Auto-detect</SelectItem>
                        <SelectItem value="formal" className="text-white hover:bg-gray-700">Formal</SelectItem>
                        <SelectItem value="polite" className="text-white hover:bg-gray-700">Polite</SelectItem>
                        <SelectItem value="casual" className="text-white hover:bg-gray-700">Casual</SelectItem>
                        <SelectItem value="genz" className="text-white hover:bg-gray-700">Gen-Z</SelectItem>
                        <SelectItem value="friends" className="text-white hover:bg-gray-700">Friends</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="default-language" className="text-white">Default Language</Label>
                    <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
                      <SelectTrigger id="default-language" className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="en" className="text-white hover:bg-gray-700">English</SelectItem>
                        <SelectItem value="es" className="text-white hover:bg-gray-700">Spanish</SelectItem>
                        <SelectItem value="fr" className="text-white hover:bg-gray-700">French</SelectItem>
                        <SelectItem value="de" className="text-white hover:bg-gray-700">German</SelectItem>
                        <SelectItem value="ja" className="text-white hover:bg-gray-700">Japanese</SelectItem>
                        <SelectItem value="zh" className="text-white hover:bg-gray-700">Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleSavePreferences} className="bg-purple-600 hover:bg-purple-700">
                  Save Preferences
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Conversation History</h3>
                  <p className="text-sm text-gray-500">
                    Your recent AI-generated responses ({history.length} items)
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportHistory}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleClearHistory}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {history.map((item) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{item.style}</Badge>
                          <span className="text-sm text-gray-500">{item.timestamp}</span>
                          {item.liked && (
                            <ThumbsUp className="w-4 h-4 text-green-600 fill-green-600" />
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyHistoryItem(item.output)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Original:</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                          {item.input}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">AI Suggestion:</p>
                        <p className="text-sm text-gray-900 bg-purple-50 p-3 rounded border border-purple-200">
                          {item.output}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Preferences;
