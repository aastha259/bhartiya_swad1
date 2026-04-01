"use client"

import React, { useState } from 'react';
import { useAuth as useFirebaseAuth } from '@/firebase';
import { 
  EmailAuthProvider, 
  reauthenticateWithCredential, 
  updatePassword 
} from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, ShieldCheck, AlertCircle } from 'lucide-react';

export default function ChangePasswordForm() {
  const auth = useFirebaseAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Basic Validation
    if (!formData.currentPassword || !formData.newPassword) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill in all password fields."
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords mismatch",
        description: "The new password and confirmation do not match."
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Weak Password",
        description: "Your new password must be at least 6 characters long."
      });
      return;
    }

    const user = auth.currentUser;
    if (!user || !user.email) {
      toast({
        variant: "destructive",
        title: "Not Authenticated",
        description: "You must be logged in to perform this action."
      });
      return;
    }

    setLoading(true);
    try {
      // 🔐 Step 1: Re-authenticate the user with their current password
      // This is a mandatory Firebase security requirement for sensitive operations
      const credential = EmailAuthProvider.credential(user.email, formData.currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // 🔐 Step 2: Update to the new password in Firebase Auth
      await updatePassword(user, formData.newPassword);

      toast({
        title: "Security Updated",
        description: "Your password has been changed successfully."
      });

      // Reset form on success
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.error("Password Update Error:", error);
      
      let message = "We encountered an error updating your password.";
      
      // Handle specific Firebase Auth error codes for better UX
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = "The current password you entered is incorrect.";
      } else if (error.code === 'auth/requires-recent-login') {
        message = "For security, please log out and log back in before changing your password.";
      } else if (error.code === 'auth/weak-password') {
        message = "The new password is too weak. Try adding symbols or numbers.";
      } else if (error.code === 'auth/user-token-expired') {
        message = "Your session has expired. Please log in again.";
      }

      toast({
        variant: "destructive",
        title: "Update Failed",
        description: message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
      <CardHeader className="bg-muted/20 p-8 border-b">
        <CardTitle className="text-xl font-headline font-black flex items-center gap-3 text-foreground">
          <ShieldCheck className="w-6 h-6 text-primary" />
          Update Security Credentials
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div className="space-y-4">
            {/* Current Password Field */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Current Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  placeholder="Verify existing password" 
                  className="pl-10 h-12 rounded-xl border-muted focus-visible:ring-primary/20"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* New Password Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="Min 6 characters" 
                    className="pl-10 h-12 rounded-xl border-muted focus-visible:ring-primary/20"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Repeat new password" 
                    className="pl-10 h-12 rounded-xl border-muted focus-visible:ring-primary/20"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>

          <Button 
            type="submit"
            className="w-full h-14 bg-primary hover:bg-primary/90 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95 group"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> <span>Securing...</span>
              </div>
            ) : (
              "Securely Update Password"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="bg-muted/10 p-6 border-t border-dashed">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
          <p className="text-[10px] text-muted-foreground font-bold italic leading-relaxed">
            Note: Changing your password will require re-authentication. For security, never share your administrative credentials with unauthorized personnel.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
