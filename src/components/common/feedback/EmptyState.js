import React from 'react';

const EmptyState = ({ 
  icon, 
  title = 'No data available', 
  message = 'Try adjusting your filters', 
  action 
}) => (
  <div className="text-center py-5">
    <div className="mb-3">
      {icon || (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="text-muted" viewBox="0 0 16 16">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
          <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
        </svg>
      )}
    </div>
    <h5 className="text-muted">{title}</h5>
    <p className="text-muted small mb-0">{message}</p>
    {action && <div className="mt-3">{action}</div>}
  </div>
);

export default EmptyState;
