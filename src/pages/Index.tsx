import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddInformationTab } from "@/components/AddInformationTab";
import { RetrievalTab } from "@/components/RetrievalTab";
import { DatabaseTab } from "@/components/DatabaseTab";
import { Plus, Search, Database } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Tabs defaultValue="add" className="w-full">
        {/* Navigation */}
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">IO</span>
                </div>
                <span className="font-semibold text-lg hidden sm:block">InfoOrganizer</span>
              </div>

              {/* Tabs */}
              <TabsList className="bg-muted/50">
                <TabsTrigger value="add" className="gap-2 data-[state=active]:bg-background">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add</span>
                </TabsTrigger>
                <TabsTrigger value="retrieval" className="gap-2 data-[state=active]:bg-background">
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline">Retrieve</span>
                </TabsTrigger>
                <TabsTrigger value="database" className="gap-2 data-[state=active]:bg-background">
                  <Database className="h-4 w-4" />
                  <span className="hidden sm:inline">Database</span>
                </TabsTrigger>
              </TabsList>

              {/* Spacer for balance */}
              <div className="w-[120px] hidden sm:block" />
            </div>
          </div>
        </header>

        {/* Tab Content */}
        <main className="container py-8 px-4">
          <TabsContent value="add" className="mt-0 animate-fade-in">
            <AddInformationTab />
          </TabsContent>
          <TabsContent value="retrieval" className="mt-0 animate-fade-in">
            <RetrievalTab />
          </TabsContent>
          <TabsContent value="database" className="mt-0 animate-fade-in">
            <DatabaseTab />
          </TabsContent>
        </main>
      </Tabs>
    </div>
  );
};

export default Index;
