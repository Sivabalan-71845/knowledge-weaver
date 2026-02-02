import { supabase } from "@/integrations/supabase/client";

export interface ClassificationResult {
  primary_domain: string;
  secondary_domain: string | null;
  confidence: number;
  reasoning: string;
}

export interface InformationEntry {
  id: string;
  content: string;
  primary_domain: string;
  secondary_domain: string | null;
  confidence: number | null;
  created_at: string;
  updated_at: string;
}

export async function classifyText(content: string): Promise<ClassificationResult> {
  const { data, error } = await supabase.functions.invoke('classify-text', {
    body: { content }
  });

  if (error) {
    console.error("Classification error:", error);
    throw new Error(error.message || "Classification failed");
  }

  // Handle fallback scenario
  if (data.error && data.fallback) {
    return data.fallback;
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}

export async function saveEntry(entry: {
  content: string;
  primary_domain: string;
  secondary_domain: string | null;
  confidence: number | null;
}): Promise<InformationEntry> {
  const { data, error } = await supabase
    .from('information_entries')
    .insert(entry)
    .select()
    .single();

  if (error) {
    console.error("Save error:", error);
    throw new Error(error.message || "Failed to save entry");
  }

  return data;
}

export async function getEntries(filters?: {
  domain?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<InformationEntry[]> {
  let query = supabase
    .from('information_entries')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.domain && filters.domain !== 'all') {
    query = query.or(`primary_domain.eq.${filters.domain},secondary_domain.eq.${filters.domain}`);
  }

  if (filters?.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }

  if (filters?.dateTo) {
    query = query.lte('created_at', `${filters.dateTo}T23:59:59`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Fetch error:", error);
    throw new Error(error.message || "Failed to fetch entries");
  }

  return data || [];
}

export async function updateEntryDomain(
  id: string, 
  primary_domain: string, 
  secondary_domain: string | null
): Promise<InformationEntry> {
  const { data, error } = await supabase
    .from('information_entries')
    .update({ primary_domain, secondary_domain })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Update error:", error);
    throw new Error(error.message || "Failed to update entry");
  }

  return data;
}

export async function deleteEntry(id: string): Promise<void> {
  const { error } = await supabase
    .from('information_entries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Delete error:", error);
    throw new Error(error.message || "Failed to delete entry");
  }
}
