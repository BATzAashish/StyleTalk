import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Sparkles, ArrowRight } from "lucide-react";

const Onboarding = () => {
  const navigate = useNavigate();
  const [tone, setTone] = useState("casual");
  const [emojiUsage, setEmojiUsage] = useState([50]);
  const [slangLevel, setSlangLevel] = useState([30]);

  const handleComplete = () => {
    // Save preferences - will integrate with Lovable Cloud later
    const preferences = {
      tone,
      emojiUsage: emojiUsage[0],
      slangLevel: slangLevel[0],
    };
    console.log("Saving preferences:", preferences);
    
    toast.success("Preferences saved! Let's start crafting messages.");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <div className="w-full max-w-2xl animate-scale-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">StyleTalk AI</h1>
          </Link>
          <p className="text-muted-foreground">Let's personalize your experience</p>
        </div>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Set Your Communication Style</CardTitle>
            <CardDescription>
              These preferences help us generate responses that match your personality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Tone Preference */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Default Tone</Label>
              <RadioGroup value={tone} onValueChange={setTone}>
                <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted transition-colors">
                  <RadioGroupItem value="formal" id="formal" />
                  <Label htmlFor="formal" className="flex-1 cursor-pointer">
                    <div className="font-medium">Formal</div>
                    <div className="text-sm text-muted-foreground">Professional and polished</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted transition-colors">
                  <RadioGroupItem value="casual" id="casual" />
                  <Label htmlFor="casual" className="flex-1 cursor-pointer">
                    <div className="font-medium">Casual</div>
                    <div className="text-sm text-muted-foreground">Friendly and relaxed</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted transition-colors">
                  <RadioGroupItem value="witty" id="witty" />
                  <Label htmlFor="witty" className="flex-1 cursor-pointer">
                    <div className="font-medium">Witty</div>
                    <div className="text-sm text-muted-foreground">Clever and humorous</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted transition-colors">
                  <RadioGroupItem value="genz" id="genz" />
                  <Label htmlFor="genz" className="flex-1 cursor-pointer">
                    <div className="font-medium">Gen-Z</div>
                    <div className="text-sm text-muted-foreground">Current and trendy</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Emoji Usage */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">Emoji Usage</Label>
                <span className="text-sm text-muted-foreground">
                  {emojiUsage[0] < 30 ? "Low" : emojiUsage[0] < 70 ? "Medium" : "High"}
                </span>
              </div>
              <Slider
                value={emojiUsage}
                onValueChange={setEmojiUsage}
                max={100}
                step={10}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Control how many emojis appear in your responses
              </p>
            </div>

            {/* Slang Level */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">Slang Level</Label>
                <span className="text-sm text-muted-foreground">
                  {slangLevel[0] < 30 ? "None" : slangLevel[0] < 70 ? "Light" : "Heavy"}
                </span>
              </div>
              <Slider
                value={slangLevel}
                onValueChange={setSlangLevel}
                max={100}
                step={10}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Adjust the amount of casual slang in responses
              </p>
            </div>

            <Button onClick={handleComplete} variant="hero" className="w-full" size="lg">
              Complete Setup
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
