import React from "react";

const HOURS = Array.from(
  { length: 24 },
  (_, i) => `${i.toString().padStart(2, "0")}:00`,
);

interface Props {
  date: string;
  startHour: string;
  endHour: string;
  onDateChange: (date: string) => void;
  onStartChange: (hour: string) => void;
  onEndChange: (hour: string) => void;
}

export default function TimeSlotPicker({
  date,
  startHour,
  endHour,
  onDateChange,
  onStartChange,
  onEndChange,
}: Props) {
  return (
    <div className="slot-picker">
      <input
        type="date"
        value={date}
        min={new Date().toISOString().split("T")[0]}
        onChange={(e) => onDateChange(e.target.value)}
      />
      <select value={startHour} onChange={(e) => onStartChange(e.target.value)}>
        <option value="">From</option>
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <select value={endHour} onChange={(e) => onEndChange(e.target.value)}>
        <option value="">To</option>
        {HOURS.filter((h) => !startHour || h > startHour).map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
    </div>
  );
}
