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
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Your Message</CardTitle>
        <CardDescription className="text-gray-400">
          Type or paste your message and select the features you want to apply
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Textarea
          placeholder="Start typing your message here..."
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          className="min-h-[200px] resize-none bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
        />

        <div className="space-y-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <h3 className="text-sm font-semibold text-white">Processing Features</h3>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="grammar" className="cursor-pointer">
              <div className="font-medium text-white">Grammar Correction</div>
              <div className="text-xs text-gray-400">Fix grammar and spelling errors</div>
            </Label>
            <Switch
              id="grammar"
              checked={grammarCorrection}
              onCheckedChange={onGrammarCorrectionChange}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="rephrasing" className="cursor-pointer">
              <div className="font-medium text-white">Sentence Rephrasing</div>
              <div className="text-xs text-gray-400">Generate concise, expanded & paraphrased versions</div>
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
                <div className="font-medium text-white">Translation</div>
                <div className="text-xs text-gray-400">Translate to another language</div>
              </Label>
              <Switch
                id="translation"
                checked={translation}
                onCheckedChange={onTranslationChange}
              />
            </div>
            {translation && (
              <Select value={targetLanguage} onValueChange={onTargetLanguageChange}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select target language" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="es" className="text-white hover:bg-gray-700">Spanish</SelectItem>
                  <SelectItem value="fr" className="text-white hover:bg-gray-700">French</SelectItem>
                  <SelectItem value="de" className="text-white hover:bg-gray-700">German</SelectItem>
                  <SelectItem value="it" className="text-white hover:bg-gray-700">Italian</SelectItem>
                  <SelectItem value="pt" className="text-white hover:bg-gray-700">Portuguese</SelectItem>
                  <SelectItem value="ja" className="text-white hover:bg-gray-700">Japanese</SelectItem>
                  <SelectItem value="ko" className="text-white hover:bg-gray-700">Korean</SelectItem>
                  <SelectItem value="zh" className="text-white hover:bg-gray-700">Chinese</SelectItem>
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
