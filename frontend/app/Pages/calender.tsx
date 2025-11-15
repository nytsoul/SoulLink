// calendar.tsx
import React, { useState } from "react";

// Simple calendar component
const Calender: React.FC = () => {
  const [date, setDate] = useState(new Date());

  // Generate days of current month
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null); // empty slots before first day
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px" }}>
      <h1>
        {date.toLocaleString("default", { month: "long" })} {year}
      </h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "10px",
          textAlign: "center",
        }}
      >
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} style={{ fontWeight: "bold" }}>
            {day}
          </div>
        ))}
        {days.map((d, i) => (
          <div
            key={i}
            style={{
              height: "50px",
              lineHeight: "50px",
              background: d ? "#f0f0f0" : "transparent",
              borderRadius: "6px",
            }}
          >
            {d}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calender;
