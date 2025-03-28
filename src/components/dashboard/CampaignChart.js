import React from 'react';
import { Card } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CHART_COLORS } from '../../constants';
import { formatChartDate } from '../../utils/dateUtils';

const CampaignChart = ({ data, loading }) => {
  if (!data || data.length === 0) {
    return (
      <Card className="mb-4">
        <Card.Body>
          <div className="text-center py-5">
            <p>No data available for chart visualization</p>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-4 border">
      <Card.Body>
        <ChartLegend />
        <ChartContent data={data} />
      </Card.Body>
    </Card>
  );
};

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

const ChartContent = ({ data }) => (
  <ResponsiveContainer width="100%" height={400}>
    <LineChart data={data} margin={{ top: 20, right: 50, left: 50, bottom: 20 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
      <XAxis 
        dataKey="date" 
        stroke="#495057"
        tickFormatter={formatChartDate}
        tick={{ fill: '#495057' }}
      />
      <YAxis 
        yAxisId="impressions" 
        orientation="left"
        stroke="#495057"
        tick={{ fill: '#495057' }}
        domain={['auto', 'auto']}
        tickFormatter={value => new Intl.NumberFormat().format(value)}
        axisLine={{ strokeWidth: 2, stroke: '#495057' }}
      />
      <YAxis 
        yAxisId="sales-spend" 
        orientation="right"
        stroke="#495057"
        tick={{ fill: '#495057' }}
        domain={['auto', 'auto']}
        tickFormatter={value => new Intl.NumberFormat().format(value)}
        axisLine={{ strokeWidth: 2, stroke: '#495057' }}
      />
      <Tooltip 
        contentStyle={{ backgroundColor: '#fff', border: '1px solid #dee2e6' }}
        labelStyle={{ color: '#212529' }}
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
);

export default CampaignChart;