'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Drone } from '@/app/types/mission';

const createMissionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  droneId: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  area: z.object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.array(z.array(z.number())))
  })
});

type CreateMissionForm = z.infer<typeof createMissionSchema>;

export default function CreateMissionForm({ drones }: { drones: Drone[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateMissionForm>({
    resolver: zodResolver(createMissionSchema),
    defaultValues: {
      droneId: '',
      area: {
        type: 'Polygon',
        coordinates: [[[0, 0], [0, 0], [0, 0], [0, 0]]] // Default empty polygon
      }
    }
  });

  const onSubmit = async (data: CreateMissionForm) => {
    try {
      setIsSubmitting(true);

      const response = await fetch('/api/missions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          status: 'scheduled',
          area: {
            type: 'Polygon',
            coordinates: [[[0, 0], [0, 0], [0, 0], [0, 0]]] // Default empty polygon
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create mission');
      }

      toast.success('Mission created successfully');
      router.push('/missions');
      router.refresh();
    } catch (error) {
      console.error('Error creating mission:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create mission');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
        <Label htmlFor="endDate">End Date (Optional)</Label>
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

      <div>
        <Label htmlFor="droneId">Assigned Drone (Optional)</Label>
        <Select
          onValueChange={(value) => {
            register('droneId').onChange({
              target: { name: 'droneId', value }
            });
          }}
        >
          <SelectTrigger className={errors.droneId ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select a drone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {drones.map((drone) => (
              <SelectItem key={drone.id} value={drone.id}>
                {drone.name} ({drone.model})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.droneId && (
          <p className="text-red-500 text-sm mt-1">{errors.droneId.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          {...register('location')}
          className={errors.location ? 'border-red-500' : ''}
        />
        {errors.location && (
          <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Mission'}
      </Button>
    </form>
  );
} 