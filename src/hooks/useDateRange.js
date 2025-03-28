import { useState } from 'react';

export const useDateRange = (defaultDays = 3) => {
  const today = new Date();
  const pastDate = new Date(today);
  pastDate.setDate(today.getDate() - defaultDays);

  const [dateRange, setDateRange] = useState({
    start: pastDate.toISOString().split('T')[0],
    end: today.toISOString().split('T')[0]
  });

  return [dateRange, setDateRange];
};
