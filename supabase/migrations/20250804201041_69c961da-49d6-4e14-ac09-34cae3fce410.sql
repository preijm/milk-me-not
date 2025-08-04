-- Create triggers to automatically generate notifications when likes and comments are added

-- Trigger for creating like notifications
CREATE TRIGGER trigger_create_like_notification
    AFTER INSERT ON likes
    FOR EACH ROW
    EXECUTE FUNCTION create_like_notification();

-- Trigger for creating comment notifications  
CREATE TRIGGER trigger_create_comment_notification
    AFTER INSERT ON comments
    FOR EACH ROW
    EXECUTE FUNCTION create_comment_notification();