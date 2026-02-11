'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// Onboarding page fully disabled
import { redirect } from 'next/navigation';
export default function OnboardingPage() {
  redirect('/dashboard');
  return null;
}
    );
}
