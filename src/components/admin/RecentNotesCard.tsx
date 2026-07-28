import { useCallback, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Pin, StickyNote } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { Skeleton } from "../ui/skeleton";
import { EmptyState } from "../ui/empty-state";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "../../hooks/use-toast";
import { useCancellableLoad } from "../../hooks/useCancellableLoad";
import { cn } from "@/lib/utils";

type NoteRow = {
  id: string;
  note: string;
  pinned: boolean;
  created_at: string;
  author_id: string;
  author?: { full_name: string | null; email: string } | null;
};

type Props = {
  userId: string;
  onViewAll?: () => void;
  /** Called after a successful quick-add so parent detail data can refresh. */
  onChanged?: () => void;
};

export function RecentNotesCard({ userId, onViewAll, onChanged }: Props) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(
    async (ctl: { isCancelled: () => boolean }) => {
      const { data, error } = await supabase
        .from("client_notes")
        .select("id, note, pinned, created_at, author_id, author:users!client_notes_author_id_fkey(full_name, email)")
        .eq("user_id", userId)
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(3);

      if (ctl.isCancelled()) return;
      if (error) throw error;
      const rows = (data || []).map((row) => {
        const authorRaw = (row as { author?: NoteRow["author"] | NoteRow["author"][] })
          .author;
        const author = Array.isArray(authorRaw) ? authorRaw[0] ?? null : authorRaw ?? null;
        return {
          id: row.id as string,
          note: row.note as string,
          pinned: row.pinned as boolean,
          created_at: row.created_at as string,
          author_id: row.author_id as string,
          author,
        } satisfies NoteRow;
      });
      setNotes(rows);
    },
    [userId]
  );

  const { loading, error, retry } = useCancellableLoad(load, [userId]);

  const sorted = useMemo(() => {
    return [...notes].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [notes]);

  const addNote = async () => {
    if (!user?.id || !draft.trim()) return;
    setSaving(true);
    try {
      const { error: insertError } = await supabase.from("client_notes").insert({
        user_id: userId,
        author_id: user.id,
        note: draft.trim(),
        pinned: false,
      });
      if (insertError) throw insertError;
      setDraft("");
      toast({ title: "Note added" });
      retry();
      onChanged?.();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to add note.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">Recent notes</CardTitle>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            View all
          </button>
        )}
      </CardHeader>
      <CardContent className="flex-1 space-y-2">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : sorted.length === 0 ? (
          <EmptyState icon={StickyNote} message="No notes yet" className="py-8" />
        ) : (
          <ul className="divide-y divide-border">
            {sorted.map((note) => {
              const expanded = expandedId === note.id;
              const authorLabel =
                user?.id === note.author_id
                  ? "You"
                  : note.author?.full_name || note.author?.email || "Unknown";
              return (
                <li key={note.id}>
                  <button
                    type="button"
                    className="w-full py-2.5 text-left"
                    onClick={() =>
                      setExpandedId((prev) => (prev === note.id ? null : note.id))
                    }
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-medium text-foreground">
                        {authorLabel}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(note.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                      {note.pinned && (
                        <Badge variant="warning" className="gap-0.5 px-1.5 py-0 text-[10px]">
                          <Pin className="h-2.5 w-2.5" strokeWidth={1.5} />
                          Pinned
                        </Badge>
                      )}
                    </div>
                    <p
                      className={cn(
                        "text-sm text-muted-foreground",
                        !expanded && "line-clamp-2"
                      )}
                    >
                      {note.note}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-2 border-t border-border pt-4">
        <Textarea
          rows={2}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a quick note..."
          disabled={saving}
        />
        <Button
          size="sm"
          className="self-end"
          disabled={saving || !draft.trim()}
          onClick={addNote}
        >
          {saving ? "Adding…" : "Add note"}
        </Button>
      </CardFooter>
    </Card>
  );
}
