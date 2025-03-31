'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { Mission, MissionStatus, Drone } from '@/app/types/mission';

const editMissionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  droneId: z.string().optional(),
  status: z.enum(['scheduled', 'in-progress', 'completed', 'aborted', 'paused'] as const),
});

type EditMissionForm = z.infer<typeof editMissionSchema>;

export default function EditMissionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [drones, setDrones] = useState<Drone[]>([]);
  const [missionData, setMissionData] = useState<Mission | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    setError,
  } = useForm<EditMissionForm>({
    resolver: zodResolver(editMissionSchema),
    defaultValues: {
      droneId: '',
      status: 'scheduled'
    }
  });

  const selectedDroneId = watch('droneId');

  useEffect(() => {
    if (params.id) {
      fetchMission();
      fetchDrones();
    } else {
      toast.error('Invalid mission ID');
      router.push('/missions', { scroll: false, replace: true });
    }
  }, [params.id]);

  const fetchDrones = async () => {
    try {
      const response = await fetch('/api/drones');
      if (!response.ok) {
        throw new Error('Failed to fetch drones');
      }
      const data = await response.json();
      console.log('Fetched drones:', data);
      setDrones(data);
    } catch (error) {
      console.error('Error fetching drones:', error);
      toast.error('Failed to fetch available drones');
    }
  };

  const fetchMission = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/missions/${params.id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch mission');
      }
      const mission: Mission = await response.json();
      console.log('Fetched mission:', mission);
      
      if (!mission) {
        throw new Error('Mission not found');
      }

      setMissionData(mission);

      // Set form values
      setValue('name', mission.name);
      setValue('description', mission.description);
      setValue('startDate', mission.startDate);
      setValue('endDate', mission.endDate || '');
      
      // Handle drone selection
      if (mission.droneId) {
        console.log('Setting drone ID:', mission.droneId);
        setValue('droneId', mission.droneId);
      }
      
      // Handle status
      setValue('status', mission.status);
    } catch (error) {
      console.error('Error fetching mission:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch mission');
      router.push('/missions', { scroll: false, replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: EditMissionForm) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // If status is being changed, use the control endpoint
      if (data.status !== missionData?.status) {
        let action: 'pause' | 'resume' | 'abort' | null = null;

        // Determine the action based on the current and new status
        if (data.status === 'in-progress') {
          action = 'resume';
        } else if (data.status === 'paused') {
          action = 'pause';
        } else if (data.status === 'aborted') {
          action = 'abort';
        }

        if (action) {
          console.log('Sending control action:', action);
          const controlResponse = await fetch(`/api/missions/${params.id}/control`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action }),
          });

          if (!controlResponse.ok) {
            const errorData = await controlResponse.json();
            throw new Error(errorData.error || 'Failed to update mission status');
          }
        }
      }

      // Update other mission details
      const response = await fetch(`/api/missions/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          startDate: data.startDate,
          endDate: data.endDate,
          droneId: data.droneId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update mission');
      }

      router.push('/missions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update mission');
    } finally {
      setIsSubmitting(false);
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
      <h1 className="text-2xl font-bold mb-6">Edit Mission</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label htmlFor="name">Mission Name</Label>
          <Input
            id="name"
            {...register('name')}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            className={errors.description ? 'border-red-500' : ''}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="datetime-local"
              {...register('startDate')}
              className={errors.startDate ? 'border-red-500' : ''}
            />
            {errors.startDate && (
              <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="datetime-local"
              {...register('endDate')}
              className={errors.endDate ? 'border-red-500' : ''}
            />
            {errors.endDate && (
              <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="droneId">Assigned Drone (Optional)</Label>
          <Select
            value={selectedDroneId}
            onValueChange={(value) => {
              console.log('Selected drone:', value);
              setValue('droneId', value);
            }}
          >
            <SelectTrigger className={errors.droneId ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select a drone (optional)">
                {drones.find(d => d.id === selectedDroneId)?.name || 'Select a drone (optional)'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {drones.map((drone) => (
                <SelectItem key={drone.id} value={drone.id}>
                  {drone.name} ({drone.batteryLevel}% battery)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.droneId && (
            <p className="text-red-500 text-sm mt-1">{errors.droneId.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={watch('status')}
            onValueChange={(value) => {
              setValue('status', value as MissionStatus);
            }}
          >
            <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="aborted">Aborted</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
          )}
        </div>

        <div className="flex gap-4 mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/missions')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
} 