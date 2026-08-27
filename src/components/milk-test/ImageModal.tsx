import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { StoryDialogClose } from "@/components/story";

interface ImageModalProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * The lightbox.
 *
 * Deliberately not a story card — a photo wants the dark scrim and nothing
 * else competing with it. What it does borrow is the site's radius and the one
 * close affordance, so it reads as this site's lightbox rather than a generic
 * one. The close sits on a white disc because it has to survive landing on a
 * pale corner of the photograph.
 */
export const ImageModal = ({ imageUrl, isOpen, onClose }: ImageModalProps) => (
  <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
    {/* One scrim. This used to wrap DialogContent in its own DialogPortal and
        DialogOverlay — but DialogContent already renders both, so opening a
        photo built two full-screen overlays at 80% each, stacked, fading in
        as separate elements. Doubly dark, and two animations where there
        should be one. */}
    <DialogContent
      closeButton={false}
      overlayClassName="bg-story-ink/80 backdrop-blur-xs"
      className="w-auto max-w-[96vw] overflow-visible border-0 bg-transparent p-0 shadow-none"
    >
      <DialogTitle className="sr-only">Product photo</DialogTitle>
      <div className="relative mx-auto w-fit">
        <img src={imageUrl} alt="Product" className="block h-auto max-h-[85dvh] w-auto max-w-[96vw] rounded-[1.25rem]" />
        <StoryDialogClose className="bg-white text-story-ink shadow-[0_6px_18px_-8px_rgba(27,36,33,0.7)] hover:bg-story-cream hover:text-story-ink" />
      </div>
    </DialogContent>
  </Dialog>
);
