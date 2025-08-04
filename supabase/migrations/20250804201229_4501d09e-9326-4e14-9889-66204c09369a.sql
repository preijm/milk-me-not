-- Add missing INSERT policy for notifications table
-- This allows the system functions to create notifications for users
CREATE POLICY "System can insert notifications for users" 
ON notifications 
FOR INSERT 
WITH CHECK (true);