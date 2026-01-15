import { UpdateBanner } from "./UpdateBanner";
import { UpdateModal } from "./UpdateModal";

/**
 * VersionCheck component that renders the appropriate update notification
 * - Minor updates: Shows a dismissible banner at the top
 * - Major updates: Shows a modal dialog
 */
export function VersionCheck() {
  return (
    <>
      <UpdateBanner />
      <UpdateModal />
    </>
  );
}
