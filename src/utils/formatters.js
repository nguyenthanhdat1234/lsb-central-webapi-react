export const formatCurrency = (value, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(value);
};

export const formatNumber = (value) => {
  return new Intl.NumberFormat().format(value);
};

export const formatPercent = (value) => {
  return `${value.toFixed(2)}%`;
};

export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    return d.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      ...options
    });
  } catch (err) {
    return '';
  }
};
