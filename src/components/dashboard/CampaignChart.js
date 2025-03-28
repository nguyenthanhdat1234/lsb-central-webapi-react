import React from 'react';
import { Card } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_COLORS } from '../../constants';
import { formatChartDate } from '../../utils/dateUtils';

const CampaignChart = ({ data }) => (
  <Card className="bg-dark text-white border-secondary mb-4">
    <Card.Body>
      <div className="d-flex mb-3">
        <ChartLegend />
      </div>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 20, right: 50, left: 50, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="date" stroke="#ddd" tickFormatter={formatChartDate} tick={{ fill: '#ddd' }} />
            
            {/* Trục Y bên trái (Impressions) - Thanh dọc màu trắng với độ đậm */}
            <YAxis 
              yAxisId="impressions" 
              orientation="left" 
              stroke="#FFFFFF" 
              tick={{ fill: '#FFFFFF' }}
              domain={['auto', 'auto']}
              tickFormatter={value => new Intl.NumberFormat().format(value)}
              axisLine={{ strokeWidth: 2, stroke: '#FFFFFF' }}
            />
            
            {/* Trục Y bên phải (Sales-Spend) - Thanh dọc màu trắng với độ đậm */}
            <YAxis 
              yAxisId="sales-spend" 
              orientation="right" 
              stroke="#FFFFFF"
              tick={{ fill: '#FFFFFF' }}
              domain={['auto', 'auto']}
              tickFormatter={value => new Intl.NumberFormat().format(value)}
              axisLine={{ strokeWidth: 2, stroke: '#FFFFFF' }}
            />
            
            <Tooltip 
              contentStyle={{ backgroundColor: '#333', border: 'none' }}
              labelStyle={{ color: '#fff' }}
              formatter={(value, name) => [new Intl.NumberFormat().format(value), name]}
              labelFormatter={formatChartDate}
            />
            
            <Line 
              yAxisId="impressions" 
              dataKey="impressions" 
              name="Impressions"
              stroke={CHART_COLORS.IMPRESSIONS} 
              strokeWidth={2}
              dot={{ r: 4, fill: CHART_COLORS.IMPRESSIONS }}
              activeDot={{ r: 6 }}
            />
            
            <Line 
              yAxisId="sales-spend" 
              dataKey="spend" 
              name="Spend"
              stroke={CHART_COLORS.SPEND} 
              strokeWidth={2}
              dot={{ r: 4, fill: CHART_COLORS.SPEND }}
              activeDot={{ r: 6 }}
            />
            
            <Line 
              yAxisId="sales-spend" 
              dataKey="sales" 
              name="Sales"
              stroke={CHART_COLORS.SALES} 
              strokeWidth={2}
              dot={{ r: 4, fill: CHART_COLORS.SALES }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center py-5">No data available</div>
      )}
    </Card.Body>
  </Card>
);

const ChartLegend = () => (
  <>
    <LegendItem color="bg-success" label="Impressions" />
    <LegendItem color="bg-warning" label="Spend" />
    <LegendItem color="bg-info" label="Sales" />
  </>
);

const LegendItem = ({ color, label }) => (
  <div className="d-flex align-items-center me-4">
    <div className={`rounded-circle ${color}`} style={{width: '12px', height: '12px'}} />
    <span className="ms-2">{label}</span>
  </div>
);

export default CampaignChart;