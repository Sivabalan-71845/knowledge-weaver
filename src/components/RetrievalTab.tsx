import { useState } from "react";
import { Search, Calendar, Filter, Loader2 } from "lucide-react";
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
import { DOMAINS } from "@/lib/domains";
import { getEntries, type InformationEntry } from "@/lib/api";
import { format } from "date-fns";
import { ConfidenceBar } from "./ConfidenceBar";

export function RetrievalTab() {
  const [domain, setDomain] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [results, setResults] = useState<InformationEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true);
    setHasSearched(true);
    
    try {
      const entries = await getEntries({
        domain: domain !== "all" ? domain : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
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
    setDateFrom("");
    setDateTo("");
    setResults([]);
    setHasSearched(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Retrieve Information</h1>
        <p className="text-muted-foreground">
          Search and filter your stored knowledge entries
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Domain Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Domain
              </label>
              <Select value={domain} onValueChange={setDomain}>
                <SelectTrigger>
                  <SelectValue placeholder="All domains" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All domains</SelectItem>
                  {DOMAINS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date From */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                From Date
              </label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                To Date
              </label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground invisible">Actions</label>
              <div className="flex gap-2">
                <Button onClick={handleSearch} disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>
              </div>
            </div>
          </div>
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
