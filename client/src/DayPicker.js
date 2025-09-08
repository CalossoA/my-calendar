import React, { useEffect, useState } from 'react';

export default function DayPicker({ value, onChange }) {
  const [days, setDays] = useState([]);

  useEffect(() => {
    fetch('/api/todo-days')
      .then(r => r.json())
      .then(setDays);
  }, []);

  return (
    <div style={{margin: '16px 0'}}>
      <input type="date" value={value} onChange={e => onChange(e.target.value)} />
      <div style={{marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4}}>
        {days.map(day => (
          <button
            key={day}
            style={{
              background: day === value ? '#1976d2' : '#333',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '4px 8px',
              cursor: 'pointer',
              fontWeight: day === value ? 'bold' : 'normal',
            }}
            onClick={() => onChange(day)}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}
