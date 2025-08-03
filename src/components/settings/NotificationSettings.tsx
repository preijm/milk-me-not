import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Heart, MessageCircle, Mail } from "lucide-react";
import { useNotificationPreferences } from "@/hooks/useNotifications";
export default function NotificationSettings() {
  const {
    preferences,
    loading,
    updatePreferences
  } = useNotificationPreferences();
  if (loading) {
    return <div>
        <h2 className="text-2xl font-bold mb-6 text-primary">Notification Settings</h2>
        <p className="text-muted-foreground">Loading notification preferences...</p>
      </div>;
  }
  return <div>
      
      
      <div className="space-y-6">
        

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-start space-x-3">
              <Heart className="w-5 h-5 text-red-500 mt-1" />
              <div>
                <Label htmlFor="likes-notifications" className="font-medium">
                  Like Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when someone likes your test results
                </p>
              </div>
            </div>
            <Switch id="likes-notifications" checked={preferences?.likes_enabled ?? true} onCheckedChange={checked => updatePreferences({
            likes_enabled: checked
          })} />
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-start space-x-3">
              <MessageCircle className="w-5 h-5 text-blue-500 mt-1" />
              <div>
                <Label htmlFor="comments-notifications" className="font-medium">
                  Comment Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when someone comments on your test results
                </p>
              </div>
            </div>
            <Switch id="comments-notifications" checked={preferences?.comments_enabled ?? true} onCheckedChange={checked => updatePreferences({
            comments_enabled: checked
          })} />
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-green-500 mt-1" />
              <div>
                <Label htmlFor="newsletter-notifications" className="font-medium">
                  Newsletter
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates about new features and product announcements
                </p>
              </div>
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