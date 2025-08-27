import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Music, ImageIcon } from "lucide-react";
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { BN } from '@coral-xyz/anchor';

interface UploadTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadTrack: (trackData: {
    title: string;
    artist: string;
    genre: string;
    ipfsCid: string; // Changed from audioFile to ipfsCid
    coverArt?: string;
  }) => Promise<void>;
}

export function UploadTrackModal({ isOpen, onClose, onUploadTrack }: UploadTrackModalProps) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("");
  const [ipfsCid, setIpfsCid] = useState(""); // Changed from uri to ipfsCid
  const [coverArt, setCoverArt] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !artist.trim() || !genre.trim() || !ipfsCid.trim()) {
      return;
    }

    setIsUploading(true);
    
    try {
      await onUploadTrack({
        title: title.trim(),
        artist: artist.trim(), 
        genre: genre.trim(),
        ipfsCid: ipfsCid.trim(),
        coverArt: coverArt.trim() || undefined
      });
      
      // Reset form
      setTitle("");
      setArtist("");
      setGenre("");
      setIpfsCid("");
      setCoverArt("");
      
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
      // TODO: Add error notification
      
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Upload Track</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Track title"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="artist">Artist</Label>
            <Input
              id="artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Artist name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="genre">Genre</Label>
            <Input
              id="genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="Genre"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="ipfsCid">IPFS CID</Label>
            <Input
              id="ipfsCid"
              value={ipfsCid}
              onChange={(e) => setIpfsCid(e.target.value)}
              placeholder="QmYourIPFSCIDHere..."
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter the IPFS CID from your Pinata upload
            </p>
          </div>
          
          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || !artist.trim() || !genre.trim() || !ipfsCid.trim() || isUploading}
              className="flex-1"
            >
              {isUploading ? "Uploading..." : "Upload Track"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}