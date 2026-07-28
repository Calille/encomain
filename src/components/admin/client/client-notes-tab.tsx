import { useMemo, useState } from "react";
import { format } from "date-fns";
import { StickyNote, Pin } from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Textarea } from "../../ui/textarea";
import { EmptyState } from "../../ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "../../../hooks/use-toast";
import { ClientDetailData, ClientNote } from "./types";

type Props = {
  data: ClientDetailData;
  onRefresh: () => void;
};

export function ClientNotesTab({ data, onRefresh }: Props) {
  const { user } = useAuth();
  const [addOpen, setAddOpen] = useState(false);
  const [editNote, setEditNote] = useState<ClientNote | null>(null);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  const sorted = useMemo(() => {
    return [...data.notes].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [data.notes]);

  const openAdd = () => {
    setText("");
    setEditNote(null);
    setAddOpen(true);
  };

  const openEdit = (note: ClientNote) => {
    setEditNote(note);
    setText(note.note);
    setAddOpen(true);
  };

  const saveNote = async () => {
    if (!user?.id) return;
    if (!text.trim()) {
      toast({
        title: "Empty note",
        description: "Write a note before saving.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      if (editNote) {
        if (editNote.author_id !== user.id) {
          toast({
            title: "Not allowed",
            description: "You can only edit your own notes.",
            variant: "destructive",
          });
          return;
        }
        const { error } = await supabase
          .from("client_notes")
          .update({ note: text.trim() })
          .eq("id", editNote.id);
        if (error) throw error;
        toast({ title: "Note updated" });
      } else {
        const { error } = await supabase.from("client_notes").insert({
          user_id: data.user.id,
          author_id: user.id,
          note: text.trim(),
          pinned: false,
        });
        if (error) throw error;
        toast({ title: "Note added" });
      }
      setAddOpen(false);
      setEditNote(null);
      setText("");
      onRefresh();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to save note.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const togglePin = async (note: ClientNote) => {
    const { error } = await supabase
      .from("client_notes")
      .update({ pinned: !note.pinned })
      .eq("id", note.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    onRefresh();
  };

  const deleteNote = async (note: ClientNote) => {
    if (!user || note.author_id !== user.id) {
      toast({
        title: "Not allowed",
        description: "You can only delete your own notes.",
        variant: "destructive",
      });
      return;
    }
    const { error } = await supabase
      .from("client_notes")
      .delete()
      .eq("id", note.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Note deleted" });
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={openAdd}>
          Add note
        </Button>
      </div>

      {sorted.length === 0 ? (
        <Card>
          <EmptyState icon={StickyNote} message="No notes for this client." />
        </Card>
      ) : (
        <div className="space-y-3">
          {sorted.map((note) => {
            const isOwn = user?.id === note.author_id;
            return (
              <Card key={note.id}>
                <CardContent className="p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    {note.pinned && (
                      <Badge variant="warning" className="gap-1">
                        <Pin className="h-3 w-3" strokeWidth={1.5} />
                        Pinned
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {note.author?.full_name || note.author?.email || "Unknown"}{" "}
                      · {format(new Date(note.created_at), "PPp")}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm">{note.note}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => togglePin(note)}
                    >
                      {note.pinned ? "Unpin" : "Pin"}
                    </Button>
                    {isOwn && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(note)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteNote(note)}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editNote ? "Edit note" : "Add note"}</DialogTitle>
            <DialogDescription>
              Internal notes are visible to admins only.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a note…"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveNote} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
