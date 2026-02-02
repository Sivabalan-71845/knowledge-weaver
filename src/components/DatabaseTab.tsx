import { useState, useEffect } from "react";
import { Loader2, Pencil, Trash2, Check, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DOMAINS } from "@/lib/domains";
import { getEntries, updateEntryDomain, deleteEntry, type InformationEntry } from "@/lib/api";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export function DatabaseTab() {
  const [entries, setEntries] = useState<InformationEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrimary, setEditPrimary] = useState("");
  const [editSecondary, setEditSecondary] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadEntries = async () => {
    setIsLoading(true);
    try {
      const data = await getEntries();
      setEntries(data);
    } catch (error) {
      toast({
        title: "Failed to load entries",
        description: error instanceof Error ? error.message : "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleStartEdit = (entry: InformationEntry) => {
    setEditingId(entry.id);
    setEditPrimary(entry.primary_domain);
    setEditSecondary(entry.secondary_domain);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditPrimary("");
    setEditSecondary(null);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      const updated = await updateEntryDomain(editingId, editPrimary, editSecondary);
      setEntries(entries.map(e => e.id === editingId ? updated : e));
      setEditingId(null);
      toast({
        title: "Entry updated",
        description: "Domain classification has been updated.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "An error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteEntry(deleteId);
      setEntries(entries.filter(e => e.id !== deleteId));
      setDeleteId(null);
      toast({
        title: "Entry deleted",
        description: "The entry has been removed from the database.",
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "An error occurred.",
        variant: "destructive",
      });
    }
  };

  const truncateContent = (content: string, maxLength = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Database</h1>
          <p className="text-muted-foreground">
            View and manage all stored information entries
          </p>
        </div>
        <Button variant="outline" onClick={loadEntries} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">No entries in the database yet.</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Content</TableHead>
                <TableHead className="w-[150px]">Primary Domain</TableHead>
                <TableHead className="w-[150px]">Secondary Domain</TableHead>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id} className="animate-fade-in">
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {entry.id.substring(0, 8)}
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <span className="text-sm">{truncateContent(entry.content)}</span>
                  </TableCell>
                  <TableCell>
                    {editingId === entry.id ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full justify-between">
                            {editPrimary}
                            <ChevronDown className="h-3 w-3 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="max-h-64 overflow-y-auto">
                          {DOMAINS.map((d) => (
                            <DropdownMenuItem key={d} onClick={() => setEditPrimary(d)}>
                              {d}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Badge variant="default">{entry.primary_domain}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === entry.id ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full justify-between">
                            {editSecondary || "None"}
                            <ChevronDown className="h-3 w-3 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="max-h-64 overflow-y-auto">
                          <DropdownMenuItem onClick={() => setEditSecondary(null)}>
                            None
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {DOMAINS.filter(d => d !== editPrimary).map((d) => (
                            <DropdownMenuItem key={d} onClick={() => setEditSecondary(d)}>
                              {d}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      entry.secondary_domain ? (
                        <Badge variant="secondary">{entry.secondary_domain}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(entry.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId === entry.id ? (
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={handleSaveEdit}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleStartEdit(entry)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => setDeleteId(entry.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
