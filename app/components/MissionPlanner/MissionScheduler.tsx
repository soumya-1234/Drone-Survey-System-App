"use client";

import { useState } from 'react';
import { MissionSchedule, RecurrencePattern } from '../../types/mission';

interface MissionSchedulerProps {
  schedule: MissionSchedule;
  onScheduleChange: (schedule: MissionSchedule) => void;
}

export default function MissionScheduler({ schedule, onScheduleChange }: MissionSchedulerProps) {
  const [localSchedule, setLocalSchedule] = useState<MissionSchedule>(schedule);

  const handleChange = (key: keyof MissionSchedule, value: string) => {
    const newSchedule = { ...localSchedule, [key]: value };
    setLocalSchedule(newSchedule);
    onScheduleChange(newSchedule);
  };

  return (
    <div className="space-y-4">
      <h3 className="heading-3">Mission Schedule</h3>
      
      <div className="form-group">
        <label htmlFor="startDate" className="form-label">Start Date</label>
        <input
          type="date"
          id="startDate"
          className="input-field"
          value={localSchedule.startDate}
          onChange={(e) => handleChange('startDate', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="startTime" className="form-label">Start Time</label>
        <input
          type="time"
          id="startTime"
          className="input-field"
          value={localSchedule.startTime}
          onChange={(e) => handleChange('startTime', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="recurrence" className="form-label">Recurrence</label>
        <select
          id="recurrence"
          className="input-field"
          value={localSchedule.recurrence}
          onChange={(e) => handleChange('recurrence', e.target.value as RecurrencePattern)}
        >
          <option value="none">One-time</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      {localSchedule.recurrence !== 'none' && (
        <div className="form-group">
          <label htmlFor="endDate" className="form-label">End Date (Optional)</label>
          <input
            type="date"
            id="endDate"
            className="input-field"
            value={localSchedule.endDate || ''}
            onChange={(e) => handleChange('endDate', e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
