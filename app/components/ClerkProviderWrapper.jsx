"use client"; 

import { ClerkProvider } from "@clerk/nextjs";

export default function ClerkProviderWrapper({ children }) {
  return <ClerkProvider signUpFallbackRedirectUrl="/select-role">{children}</ClerkProvider>;
}
