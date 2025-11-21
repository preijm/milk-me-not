import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Heart, MessageCircle, Mail, ArrowLeft } from "lucide-react";
import { useNotificationPreferences } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
export default function NotificationSettings() {
  const {
    preferences,
    loading,
    updatePreferences
  } = useNotificationPreferences();
  const navigate = useNavigate();
  const isMobileOrTablet = typeof window !== 'undefined' && window.innerWidth < 1024;
  
  if (loading) {
    return <div>
        {isMobileOrTablet && (
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/account')}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Notifications</h1>
          </div>
        )}
        <p className="text-muted-foreground">Loading notification preferences...</p>
      </div>;
  }
  return <div>
      {isMobileOrTablet && (
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/account')}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Notifications</h1>
        </div>
      )}
      
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-start space-x-3">
              <Heart className="w-5 h-5 text-notification-like mt-1" />
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
              <MessageCircle className="w-5 h-5 text-notification-comment mt-1" />
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
              <Mail className="w-5 h-5 text-notification-newsletter mt-1" />
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