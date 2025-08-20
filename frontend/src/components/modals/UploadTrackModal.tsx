import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, Music, ImageIcon } from "lucide-react";

interface UploadTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadTrack: (track: {
    title: string;
    artist: string;
    audioFile: File | null;
    coverArt: File | null;
  }) => void;
}

export function UploadTrackModal({ isOpen, onClose, onUploadTrack }: UploadTrackModalProps) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverArt, setCoverArt] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && artist.trim() && audioFile) {
      setIsUploading(true);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onUploadTrack({
        title: title.trim(),
        artist: artist.trim(),
        audioFile,
        coverArt
      });
      
      resetForm();
      setIsUploading(false);
      onClose();
    }
  };

  const resetForm = () => {
    setTitle("");
    setArtist("");
    setAudioFile(null);
    setCoverArt(null);
    setIsUploading(false);
  };

  const handleClose = () => {
    if (!isUploading) {
      resetForm();
      onClose();
    }
  };

  const isFormValid = title.trim() && artist.trim() && audioFile;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border shadow-elevated">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <Upload className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <DialogTitle className="text-card-foreground">Upload Track</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Upload your music file.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Track Title */}
          <div className="space-y-2">
            <Label htmlFor="track-title" className="text-card-foreground font-medium">
              Track Title
            </Label>
            <Input
              id="track-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter track title..."
              className="bg-input border-border focus:border-primary focus:ring-primary/20"
              disabled={isUploading}
            />
          </div>

          {/* Artist Name */}
          <div className="space-y-2">
            <Label htmlFor="artist-name" className="text-card-foreground font-medium">
              Artist Name
            </Label>
            <Input
              id="artist-name"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Enter artist name..."
              className="bg-input border-border focus:border-primary focus:ring-primary/20"
              disabled={isUploading}
            />
          </div>

          {/* Audio File */}
          <div className="space-y-2">
            <Label htmlFor="audio-file" className="text-card-foreground font-medium">
              Audio File
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="audio-file"
                type="file"
                accept="audio/*"
                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                className="bg-input border-border focus:border-primary focus:ring-primary/20"
                disabled={isUploading}
              />
              <Music className="w-5 h-5 text-muted-foreground" />
            </div>
            {audioFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {audioFile.name}
              </p>
            )}
          </div>

          {/* Cover Art */}
          <div className="space-y-2">
            <Label htmlFor="cover-art" className="text-card-foreground font-medium">
              Cover Art (Optional)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="cover-art"
                type="file"
                accept="image/*"
                onChange={(e) => setCoverArt(e.target.files?.[0] || null)}
                className="bg-input border-border focus:border-primary focus:ring-primary/20"
                disabled={isUploading}
              />
              <ImageIcon className="w-5 h-5 text-muted-foreground" />
            </div>
            {coverArt && (
              <p className="text-sm text-muted-foreground">
                Selected: {coverArt.name}
              </p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isUploading}
              className="flex-1 bg-secondary hover:bg-secondary/80"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isUploading}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Uploading...
                </div>
              ) : (
                "Upload Track"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}