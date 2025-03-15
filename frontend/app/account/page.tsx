'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { authService, User } from '@/src/lib/api';

interface UserProfile extends Omit<User, 'id'> {
  id: string;
  username?: string;
  createdAt: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    const token = authService.getToken();
    console.log('Current JWT token:', token);
    
    if (!token) {
      console.log('No token found, redirecting to login');
      router.push('/auth/login');
      return;
    }

    fetchProfile();
  }, [router]);

  const fetchProfile = async () => {
    try {
      const response = await authService.getProfile();
      console.log('Raw API response:', response);
      
      if (!response.data?.user) {
        throw new Error('No profile data received');
      }

      const userData = response.data.user;
      console.log('User data:', userData);

      // Convert the User type to UserProfile type with safe access
      const userProfile: UserProfile = {
        ...userData,
        id: String(userData.id || ''),
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        role: userData.role || '',
        username: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
        createdAt: new Date().toISOString()
      };

      console.log('Converted user profile:', userProfile);
      setProfile(userProfile);
      setFormData(userProfile);
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Profile fetch error:', error);
      console.error('Full error details:', {
        error,
        message: error.message,
        stack: error.stack
      });
      toast.error('Failed to load profile', {
        description: error.message || 'Please try again later'
      });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Form data before update:', formData);

      // Convert UserProfile type back to User type for the API
      const userData: Partial<User> = {
        ...formData,
        id: formData.id ? Number(formData.id) : undefined,
      };

      console.log('Converted user data for API:', userData);

      const response = await authService.updateProfile(userData);
      console.log('Update response:', response);
      
      if (!response.data?.user) {
        throw new Error('No response data from update');
      }

      const updatedUserData = response.data.user;

      // Convert the response back to UserProfile
      const updatedProfile: UserProfile = {
        ...updatedUserData,
        id: String(updatedUserData.id || ''),
        first_name: updatedUserData.first_name || '',
        last_name: updatedUserData.last_name || '',
        email: updatedUserData.email || '',
        role: updatedUserData.role || '',
        username: `${updatedUserData.first_name || ''} ${updatedUserData.last_name || ''}`.trim(),
        createdAt: profile?.createdAt || new Date().toISOString()
      };

      console.log('Updated profile:', updatedProfile);
      setProfile(updatedProfile);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Profile update error:', error);
      console.error('Full error details:', {
        error,
        message: error.message,
        stack: error.stack
      });
      toast.error('Failed to update profile', {
        description: error.message || 'Please try again later'
      });
    }
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.username}`} />
            <AvatarFallback>{profile.first_name.substring(0, 1)}{profile.last_name.substring(0, 1)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">Account Settings</h1>
            <p className="text-muted-foreground">Manage your account information</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={isEditing ? formData.first_name : profile.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={isEditing ? formData.last_name : profile.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={isEditing ? formData.email : profile.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Input
                value={profile.role}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label>Member Since</Label>
              <Input
                value={new Date(profile.createdAt).toLocaleDateString()}
                disabled
              />
            </div>

            <div className="flex gap-4 pt-4">
              {!isEditing ? (
                <Button type="button" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button type="submit">Save Changes</Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setIsEditing(false);
                    setFormData(profile);
                  }}>
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
