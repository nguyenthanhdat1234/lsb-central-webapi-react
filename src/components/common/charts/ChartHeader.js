import React from 'react';

const ChartHeader = ({ title, legends }) => (
  <div className="d-flex justify-content-between align-items-center mb-4">
    <h5 className="card-title mb-0">{title}</h5>
    <div className="d-flex">
      {legends.map((legend, index) => (
        <div key={index} className="d-flex align-items-center me-3">
          <div className="rounded-circle" 
               style={{width: '10px', height: '10px', backgroundColor: legend.color}} />
          <span className="ms-2 text-muted small">{legend.label}</span>
        </div>
      ))}
    </div>
  </div>
);

export default ChartHeader;
