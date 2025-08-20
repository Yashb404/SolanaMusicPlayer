import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { List } from "lucide-react";

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePlaylist: (name: string) => void;
}

export function CreatePlaylistModal({ isOpen, onClose, onCreatePlaylist }: CreatePlaylistModalProps) {
  const [playlistName, setPlaylistName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playlistName.trim()) {
      onCreatePlaylist(playlistName.trim());
      setPlaylistName("");
      onClose();
    }
  };

  const handleClose = () => {
    setPlaylistName("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border shadow-elevated">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <List className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <DialogTitle className="text-card-foreground">Create Playlist</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Give your playlist a name.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="playlist-name" className="text-card-foreground font-medium">
              Playlist Name
            </Label>
            <Input
              id="playlist-name"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="Enter playlist name..."
              className="bg-input border-border focus:border-primary focus:ring-primary/20"
              autoFocus
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              className="bg-secondary hover:bg-secondary/80"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!playlistName.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Create Playlist
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}