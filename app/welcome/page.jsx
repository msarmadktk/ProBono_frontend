"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

const Welcome = () => {
    const router = useRouter();
    const { user, isSignedIn } = useUser();
    const [redirectUrl, setRedirectUrl] = useState('/dashboard');
    const [isReadyToRender, setIsReadyToRender] = useState(false);
  
    useEffect(() => {
      if (isSignedIn && user) {
        const role = user?.unsafeMetadata?.role;
        if (role) {
          router.push(`/dashboard/${role.toLowerCase()}`);
        } else {
          router.push('/select-role');
        }
      }
    }, [isSignedIn, user, router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 rounded-full animate-spin bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-2">
          <div className="w-full h-full bg-white rounded-full"></div>
        </div>
      </div>
    )
}

export default Welcome