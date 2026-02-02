import { useState } from "react";
import { Check, Pencil, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfidenceBar } from "./ConfidenceBar";
import { DOMAINS, type Domain } from "@/lib/domains";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AIPanelProps {
  primaryDomain: string;
  secondaryDomain: string | null;
  confidence: number;
  reasoning?: string;
  onConfirm: (primaryDomain: string, secondaryDomain: string | null) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AIPanel({
  primaryDomain,
  secondaryDomain,
  confidence,
  reasoning,
  onConfirm,
  onCancel,
  isLoading = false,
}: AIPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrimary, setEditedPrimary] = useState(primaryDomain);
  const [editedSecondary, setEditedSecondary] = useState(secondaryDomain);
  const [customPrimary, setCustomPrimary] = useState("");
  const [customSecondary, setCustomSecondary] = useState("");
  const [showCustomPrimary, setShowCustomPrimary] = useState(false);
  const [showCustomSecondary, setShowCustomSecondary] = useState(false);

  const handlePrimarySelect = (domain: string) => {
    if (domain === "custom") {
      setShowCustomPrimary(true);
    } else {
      setEditedPrimary(domain);
      setShowCustomPrimary(false);
      setCustomPrimary("");
    }
  };

  const handleSecondarySelect = (domain: string | null) => {
    if (domain === "custom") {
      setShowCustomSecondary(true);
    } else {
      setEditedSecondary(domain);
      setShowCustomSecondary(false);
      setCustomSecondary("");
    }
  };

  const handleCustomPrimaryConfirm = () => {
    if (customPrimary.trim()) {
      setEditedPrimary(customPrimary.trim());
      setShowCustomPrimary(false);
    }
  };

  const handleCustomSecondaryConfirm = () => {
    if (customSecondary.trim()) {
      setEditedSecondary(customSecondary.trim());
      setShowCustomSecondary(false);
    }
  };

  const handleConfirm = () => {
    onConfirm(editedPrimary, editedSecondary);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedPrimary(primaryDomain);
    setEditedSecondary(secondaryDomain);
    setShowCustomPrimary(false);
    setShowCustomSecondary(false);
    setCustomPrimary("");
    setCustomSecondary("");
  };

  return (
    <div className="ai-panel animate-fade-in">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            AI Classification Result
          </h3>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Pencil className="h-4 w-4 mr-1.5" />
              Edit Domain
            </Button>
          )}
        </div>

        {/* Domains */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Primary Domain */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Primary Domain</label>
            {isEditing ? (
              <div className="space-y-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {editedPrimary}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 max-h-64 overflow-y-auto">
                    {DOMAINS.map((domain) => (
                      <DropdownMenuItem
                        key={domain}
                        onClick={() => handlePrimarySelect(domain)}
                      >
                        {domain}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handlePrimarySelect("custom")}>
                      Write yourself...
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {showCustomPrimary && (
                  <div className="flex gap-2">
                    <Input
                      value={customPrimary}
                      onChange={(e) => setCustomPrimary(e.target.value)}
                      placeholder="Enter custom domain"
                      onKeyDown={(e) => e.key === "Enter" && handleCustomPrimaryConfirm()}
                    />
                    <Button size="sm" onClick={handleCustomPrimaryConfirm}>
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-lg font-semibold text-foreground">{primaryDomain}</p>
            )}
          </div>

          {/* Secondary Domain */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Secondary Domain</label>
            {isEditing ? (
              <div className="space-y-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {editedSecondary || "None"}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 max-h-64 overflow-y-auto">
                    <DropdownMenuItem onClick={() => handleSecondarySelect(null)}>
                      None
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {DOMAINS.filter(d => d !== editedPrimary).map((domain) => (
                      <DropdownMenuItem
                        key={domain}
                        onClick={() => handleSecondarySelect(domain)}
                      >
                        {domain}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleSecondarySelect("custom")}>
                      Write yourself...
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {showCustomSecondary && (
                  <div className="flex gap-2">
                    <Input
                      value={customSecondary}
                      onChange={(e) => setCustomSecondary(e.target.value)}
                      placeholder="Enter custom domain"
                      onKeyDown={(e) => e.key === "Enter" && handleCustomSecondaryConfirm()}
                    />
                    <Button size="sm" onClick={handleCustomSecondaryConfirm}>
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-lg font-semibold text-foreground">
                {secondaryDomain || <span className="text-muted-foreground font-normal">None</span>}
              </p>
            )}
          </div>
        </div>

        {/* Confidence */}
        <ConfidenceBar confidence={confidence} />

        {/* Reasoning */}
        {reasoning && (
          <p className="text-sm text-muted-foreground italic">
            {reasoning}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {isEditing ? (
            <>
              <Button onClick={handleConfirm} disabled={isLoading} className="flex-1">
                <Check className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancelEdit}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleConfirm} disabled={isLoading} className="flex-1">
                <Check className="h-4 w-4 mr-2" />
                Confirm & Save
              </Button>
              <Button variant="outline" onClick={onCancel}>
                Discard
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
