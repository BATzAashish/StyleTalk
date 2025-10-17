import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InputSectionProps {
  input: string;
  onInputChange: (value: string) => void;
  grammarCorrection: boolean;
  onGrammarCorrectionChange: (value: boolean) => void;
  rephrasing: boolean;
  onRephrasingChange: (value: boolean) => void;
  translation: boolean;
  onTranslationChange: (value: boolean) => void;
  targetLanguage: string;
  onTargetLanguageChange: (value: string) => void;
}

const InputSection = ({
  input,
  onInputChange,
  grammarCorrection,
  onGrammarCorrectionChange,
  rephrasing,
  onRephrasingChange,
  translation,
  onTranslationChange,
  targetLanguage,
  onTargetLanguageChange,
}: InputSectionProps) => {
  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle>Your Message</CardTitle>
        <CardDescription>
          Type or paste your message and select the features you want to apply
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Textarea
          placeholder="Start typing your message here..."
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          className="min-h-[200px] resize-none"
        />

        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          <h3 className="text-sm font-semibold">Processing Features</h3>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="grammar" className="cursor-pointer">
              <div className="font-medium">Grammar Correction</div>
              <div className="text-xs text-muted-foreground">Fix grammar and spelling errors</div>
            </Label>
            <Switch
              id="grammar"
              checked={grammarCorrection}
              onCheckedChange={onGrammarCorrectionChange}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="rephrasing" className="cursor-pointer">
              <div className="font-medium">Sentence Rephrasing</div>
              <div className="text-xs text-muted-foreground">Generate concise, expanded & paraphrased versions</div>
            </Label>
            <Switch
              id="rephrasing"
              checked={rephrasing}
              onCheckedChange={onRephrasingChange}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="translation" className="cursor-pointer">
                <div className="font-medium">Translation</div>
                <div className="text-xs text-muted-foreground">Translate to another language</div>
              </Label>
              <Switch
                id="translation"
                checked={translation}
                onCheckedChange={onTranslationChange}
              />
            </div>
            {translation && (
              <Select value={targetLanguage} onValueChange={onTargetLanguageChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="it">Italian</SelectItem>
                  <SelectItem value="pt">Portuguese</SelectItem>
                  <SelectItem value="ja">Japanese</SelectItem>
                  <SelectItem value="ko">Korean</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InputSection;
