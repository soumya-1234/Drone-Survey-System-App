'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import CreateMissionForm from '@/app/components/Dashboard/CreateMissionForm';
import { Drone } from '@/app/types/mission';

export default function CreateMissionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [drones, setDrones] = useState<Drone[]>([]);

  useEffect(() => {
    fetchDrones();
  }, []);

  const fetchDrones = async () => {
    try {
      const response = await fetch('/api/drones');
      if (!response.ok) {
        throw new Error('Failed to fetch drones');
      }
      const data = await response.json();
      setDrones(data);
    } catch (error) {
      console.error('Error fetching drones:', error);
      toast.error('Failed to fetch available drones');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Mission</h1>
      <CreateMissionForm drones={drones} />
    </div>
  );
} 