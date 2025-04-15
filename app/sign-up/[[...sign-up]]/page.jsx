'use client';
import { SignUp, useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
 
  return (
    <div className='flex items-center justify-center mt-8'>
      <SignUp />
    </div>
  );
}
