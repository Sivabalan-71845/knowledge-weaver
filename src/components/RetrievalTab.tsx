import { useState } from "react";
import { Search, Calendar, Filter, Loader2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DOMAINS } from "@/lib/domains";
import { getEntries, type InformationEntry, type RetrievalMode } from "@/lib/api";
import { format } from "date-fns";
import { ConfidenceBar } from "./ConfidenceBar";

export function RetrievalTab() {
  const [mode, setMode] = useState<RetrievalMode>("domain");
  const [domain, setDomain] = useState<string>("all");
  const [keyword, setKeyword] = useState("");
  const [date, setDate] = useState("");
  const [results, setResults] = useState<InformationEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true);
    setHasSearched(true);
    
    try {
      const entries = await getEntries({
        mode,
        domain: mode === "domain" ? domain : undefined,
        keyword: mode === "keyword" ? keyword : undefined,
        date: mode === "date" ? date : undefined,
      });
      setResults(entries);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setDomain("all");
    setKeyword("");
    setDate("");
    setResults([]);
    setHasSearched(false);
  };

  const handleModeChange = (newMode: string) => {
    setMode(newMode as RetrievalMode);
    setResults([]);
    setHasSearched(false);
  };

  const isSearchDisabled = () => {
    if (mode === "domain") return domain === "all";
    if (mode === "keyword") return !keyword.trim();
    if (mode === "date") return !date;
    return true;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Retrieve Information</h1>
        <p className="text-muted-foreground">
          Search your stored knowledge by domain, keyword, or date
        </p>
      </div>

      {/* Search Mode Tabs */}
      <Card>
        <CardContent className="pt-6">
          <Tabs value={mode} onValueChange={handleModeChange} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="domain" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                By Domain
              </TabsTrigger>
              <TabsTrigger value="keyword" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                By Keyword
              </TabsTrigger>
              <TabsTrigger value="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                By Date
              </TabsTrigger>
            </TabsList>

            <TabsContent value="domain" className="space-y-4">
              <div className="flex gap-3">
                <Select value={domain} onValueChange={setDomain}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a domain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Select a domain...</SelectItem>
                    {DOMAINS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleSearch} disabled={isLoading || isSearchDisabled()}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
                <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="keyword" className="space-y-4">
              <div className="flex gap-3">
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Enter keyword to search"
                  className="flex-1"
                  onKeyDown={(e) => e.key === "Enter" && !isSearchDisabled() && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={isLoading || isSearchDisabled()}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
                <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="date" className="space-y-4">
              <div className="flex gap-3">
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={isLoading || isSearchDisabled()}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
                <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : hasSearched && results.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No entries found matching your criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((entry) => (
            <Card key={entry.id} className="animate-fade-in">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="default">{entry.primary_domain}</Badge>
                    {entry.secondary_domain && (
                      <Badge variant="secondary">{entry.secondary_domain}</Badge>
                    )}
                    <span className="text-sm text-muted-foreground ml-auto">
                      {format(new Date(entry.created_at), "PPP")}
                    </span>
                  </div>

                  {/* Content */}
                  <p className="text-foreground leading-relaxed">
                    {entry.content.length > 400 
                      ? `${entry.content.substring(0, 400)}...` 
                      : entry.content}
                  </p>

                  {/* Keywords */}
                  {entry.keywords && entry.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {entry.keywords.map((kw) => (
                        <Badge key={kw} variant="outline" className="text-xs">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Confidence */}
                  {entry.confidence && (
                    <div className="max-w-xs">
                      <ConfidenceBar confidence={entry.confidence} size="sm" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
