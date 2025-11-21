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
                Get notified when someone likes your test results
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
                Get notified when someone comments on your test results
              </p>
            </div>
            <Switch id="comments-notifications" checked={preferences?.comments_enabled ?? true} onCheckedChange={checked => updatePreferences({
            comments_enabled: checked
          })} />
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="newsletter-notifications" className="font-medium">
                Newsletters
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive updates about new features and product announcements
              </p>
            </div>
            <Switch 
              id="newsletter-notifications" 
              checked={preferences?.newsletter_enabled ?? true} 
              onCheckedChange={checked => updatePreferences({
                newsletter_enabled: checked
              })} 
            />
          </div>
        </div>
        
        
      </div>
    </div>;
}