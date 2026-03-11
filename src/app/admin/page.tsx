
"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Base admin route redirects to the dashboard
    router.push('/admin/dashboard');
  }, [router]);

  return null;
}
