'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';

const createDroneSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  model: z.string().min(1, 'Model is required'),
  maxPayload: z.number().min(0, 'Maximum payload must be positive'),
  maxFlightTime: z.number().min(0, 'Maximum flight time must be positive'),
  maxRange: z.number().min(0, 'Maximum range must be positive'),
});

type CreateDroneForm = z.infer<typeof createDroneSchema>;

export default function NewDronePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateDroneForm>({
    resolver: zodResolver(createDroneSchema),
  });

  const onSubmit = async (data: CreateDroneForm) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/drones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create drone');
      }

      toast.success('Drone created successfully');
      router.push('/fleet');
    } catch (error) {
      console.error('Error creating drone:', error);
      toast.error('Failed to create drone');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Add New Drone</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <div>
          <Label htmlFor="name">Drone Name</Label>
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
          <Label htmlFor="model">Model</Label>
          <Input
            id="model"
            {...register('model')}
            className={errors.model ? 'border-red-500' : ''}
          />
          {errors.model && (
            <p className="text-red-500 text-sm mt-1">{errors.model.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="maxPayload">Maximum Payload (kg)</Label>
          <Input
            id="maxPayload"
            type="number"
            step="0.1"
            {...register('maxPayload', { valueAsNumber: true })}
            className={errors.maxPayload ? 'border-red-500' : ''}
          />
          {errors.maxPayload && (
            <p className="text-red-500 text-sm mt-1">{errors.maxPayload.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="maxFlightTime">Maximum Flight Time (minutes)</Label>
          <Input
            id="maxFlightTime"
            type="number"
            {...register('maxFlightTime', { valueAsNumber: true })}
            className={errors.maxFlightTime ? 'border-red-500' : ''}
          />
          {errors.maxFlightTime && (
            <p className="text-red-500 text-sm mt-1">{errors.maxFlightTime.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="maxRange">Maximum Range (km)</Label>
          <Input
            id="maxRange"
            type="number"
            step="0.1"
            {...register('maxRange', { valueAsNumber: true })}
            className={errors.maxRange ? 'border-red-500' : ''}
          />
          {errors.maxRange && (
            <p className="text-red-500 text-sm mt-1">{errors.maxRange.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Drone'}
        </Button>
      </form>
    </div>
  );
} 