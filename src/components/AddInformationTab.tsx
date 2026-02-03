import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AIPanel } from "./AIPanel";
import { classifyText, saveEntry, type ClassificationResult } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function AddInformationTab() {
  const [content, setContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter some text to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setClassification(null);
    setSaveSuccess(false);

    try {
      const result = await classifyText(content);
      setClassification(result);
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "An error occurred during analysis.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirm = async (primaryDomain: string, secondaryDomain: string | null, keywords: string[]) => {
    setIsSaving(true);
    
    // Optimistic UI - show success immediately
    setSaveSuccess(true);
    
    try {
      await saveEntry({
        content,
        primary_domain: primaryDomain,
        secondary_domain: secondaryDomain,
        confidence: classification?.confidence || null,
        keywords: keywords,
      });
      
      toast({
        title: "Saved successfully",
        description: "Your information has been stored.",
      });
      
      // Reset form after successful save
      setTimeout(() => {
        setContent("");
        setClassification(null);
        setSaveSuccess(false);
      }, 1500);
    } catch (error) {
      setSaveSuccess(false);
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save entry.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setClassification(null);
  };

  const handleReset = () => {
    setContent("");
    setClassification(null);
    setSaveSuccess(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Logo placeholder */}
      <div className="flex justify-center">
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <span className="text-primary font-bold text-xl">IO</span>
        </div>
      </div>

      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Add Information</h1>
        <p className="text-muted-foreground">
          Enter your text below for AI-assisted semantic classification
        </p>
      </div>

      {/* Success state */}
      {saveSuccess && (
        <div className="text-center py-8 animate-fade-in">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-confidence-high/10 mb-4">
            <svg className="h-8 w-8 text-confidence-high" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Saved Successfully</h2>
          <p className="text-muted-foreground">Your information has been stored in the database.</p>
        </div>
      )}

      {/* Input area */}
      {!saveSuccess && (
        <>
          <div className="space-y-3">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste or type your text here..."
              className="min-h-[200px] resize-y text-base"
              disabled={isAnalyzing || !!classification}
            />
            
            <div className="flex gap-3">
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !content.trim() || !!classification}
                className="flex-1"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze with AI"
                )}
              </Button>
              
              {(content || classification) && (
                <Button variant="outline" onClick={handleReset}>
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* AI Panel */}
          {classification && (
            <AIPanel
              primaryDomain={classification.primary_domain}
              secondaryDomain={classification.secondary_domain}
              confidence={classification.confidence}
              reasoning={classification.reasoning}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              isLoading={isSaving}
            />
          )}
        </>
      )}
    </div>
  );
}
