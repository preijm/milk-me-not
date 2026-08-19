import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useNotificationPreferences } from "@/hooks/useNotifications";
export default function NotificationSettings() {
  const {
    preferences,
    loading,
    updatePreferences
  } = useNotificationPreferences();
  
  if (loading) {
    return <div>
        <p className="text-muted-foreground">Loading notification preferences...</p>
      </div>;
  }
  return <div className="pt-6">
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="likes-notifications" className="font-medium">
                Likes
              </Label>
              <p className="text-sm text-muted-foreground">
                Show up in your inbox when someone likes a rating you left
              </p>
            </div>
            <Switch id="likes-notifications" checked={preferences?.likes_enabled ?? true} onCheckedChange={checked => updatePreferences({
            likes_enabled: checked
          })} />
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="comments-notifications" className="font-medium">
                Comments
              </Label>
              <p className="text-sm text-muted-foreground">
                Show up in your inbox when someone replies to a rating you left
              </p>
            </div>
            <Switch id="comments-notifications" checked={preferences?.comments_enabled ?? true} onCheckedChange={checked => updatePreferences({
            comments_enabled: checked
          })} />
          </div>
        </div>
        
        
      </div>
    </div>;
}