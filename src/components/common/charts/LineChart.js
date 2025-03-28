import React from 'react';
import { Card } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Chart = ({ 
  data, 
  title,
  height = 350,
  lines = [],
  xAxisKey = 'date',
  gridColor = '#eee',
  tooltipFormatter
}) => (
  <Card className="border-0 shadow-sm mb-4">
    <Card.Body>
      <h5 className="card-title mb-4">{title}</h5>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey={xAxisKey} stroke="#666" />
          <YAxis stroke="#666" />
          <Tooltip formatter={tooltipFormatter} />
          {lines.map(({ key, color, name }) => (
            <Line 
              key={key}
              type="monotone" 
              dataKey={key} 
              name={name}
              stroke={color}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Card.Body>
  </Card>
);

export default Chart;
