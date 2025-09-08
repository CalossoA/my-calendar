import React, { useMemo } from 'react';

function getWeekDays(date) {
  const d = new Date(date);
  const day = d.getDay();
  const start = new Date(d);
  start.setDate(d.getDate() - day + (day === 0 ? -6 : 1)); // Lunedì
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(start);
    dt.setDate(start.getDate() + i);
    return dt.toISOString().slice(0, 10);
  });
}

function getMonthDays(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth();
  const last = new Date(year, month + 1, 0);
  return Array.from({ length: last.getDate() }, (_, i) => {
    const dt = new Date(year, month, i + 1);
    return dt.toISOString().slice(0, 10);
  });
}

export function WeekView({ todos, viewDate, onSelectDay }) {
  const weekDays = useMemo(() => getWeekDays(viewDate), [viewDate]);
  return (
    <div style={{display: 'flex', gap: 8, justifyContent: 'center', margin: '16px 0'}}>
      {weekDays.map(day => (
        <div key={day} style={{textAlign: 'center', cursor: 'pointer'}} onClick={() => onSelectDay(day)}>
          <div style={{fontWeight: day === viewDate ? 'bold' : 'normal', color: day === viewDate ? '#1976d2' : '#fff'}}>{day.slice(8,10)}/{day.slice(5,7)}</div>
          <div style={{fontSize: 12, color: '#aaa'}}>{todos.filter(t => t.date && t.date.startsWith(day)).length} task</div>
        </div>
      ))}
    </div>
  );
}

export function MonthView({ todos, viewDate, onSelectDay }) {
  const monthDays = useMemo(() => getMonthDays(viewDate), [viewDate]);
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', margin: '16px 0'}}>
      {monthDays.map(day => (
        <div key={day} style={{width: 36, height: 36, background: day === viewDate ? '#1976d2' : '#333', color: '#fff', borderRadius: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: day === viewDate ? 'bold' : 'normal'}} onClick={() => onSelectDay(day)}>
          {day.slice(8,10)}
          <span style={{fontSize: 10, color: '#aaa'}}>{todos.filter(t => t.date && t.date.startsWith(day)).length > 0 ? '●' : ''}</span>
        </div>
      ))}
    </div>
  );
}
