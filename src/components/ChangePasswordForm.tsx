
"use client"

import React, { useState } from 'react';
import { useAuth as useFirebaseAuth } from '@/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
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
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords mismatch",
        description: "New passwords do not match."
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Weak Password",
        description: "Password must be at least 6 characters."
      });
      return;
    }

    const user = auth.currentUser;
    if (!user || !user.email) {
      toast({
        variant: "destructive",
        title: "Not Authenticated",
        description: "You must be logged in to change your password."
      });
      return;
    }

    setLoading(true);
    try {
      // 1. Re-authenticate the user
      const credential = EmailAuthProvider.credential(user.email, formData.currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // 2. Update the password
      await updatePassword(user, formData.newPassword);

      toast({
        title: "Password Updated",
        description: "Your security credentials have been successfully refreshed."
      });

      // 3. Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.error(error);
      let message = "Could not update password.";
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = "The current password you entered is incorrect.";
      } else if (error.code === 'auth/requires-recent-login') {
        message = "This operation is sensitive and requires recent authentication. Please log in again.";
      } else if (error.code === 'auth/weak-password') {
        message = "The new password is too weak.";
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
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Current Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  placeholder="Verify your current identity" 
                  className="pl-10 h-12 rounded-xl border-muted focus-visible:ring-primary/20"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

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
              <Loader2 className="w-6 h-6 animate-spin" />
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
            Safety Tip: For maximum security, use a combination of symbols, numbers, and capital letters. Your password must be at least 6 characters long.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
