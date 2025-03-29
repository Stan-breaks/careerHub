"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface VerifyButtonProps {
  userId: string;
  onVerified?: () => void;
}

export function VerifyButton({ userId, onVerified }: VerifyButtonProps) {
  const [verifying, setVerifying] = useState(false);
  const router = useRouter();

  const handleVerify = async () => {
    try {
      setVerifying(true);
      
      console.log(`Attempting to verify user: ${userId}`);
      
      const response = await fetch('/api/admin/users/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify user');
      }
      
      console.log('Verification response:', data);
      
      if (!data.success || !data.user.isVerified) {
        throw new Error('Verification was not successful');
      }
      
      // Force a hard refresh by navigating to the current page
      router.refresh();
      
      // Small delay to ensure database changes are reflected
      setTimeout(() => {
        // Call the callback if provided
        if (onVerified) {
          onVerified();
        }
        
        // Show success message
        alert('User has been verified successfully!');
      }, 500);
      
    } catch (error) {
      console.error('Error verifying user:', error);
      alert(`Failed to verify user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <button
      onClick={handleVerify}
      disabled={verifying}
      className="text-xs bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
    >
      {verifying ? 'Verifying...' : 'Verify'}
    </button>
  );
} 