'use client';
import { SignIn, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function Page() {

  return (
    <div className='flex justify-center items-center mt-8'>
      <SignIn fallbackRedirectUrl={'/welcome'} />
    </div>
  );
}