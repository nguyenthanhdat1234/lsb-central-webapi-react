import React from 'react';
import { Card } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SellerChart = ({ data }) => (
  <Card className="border-0 shadow-sm mb-4">
    <Card.Body>
      <h5 className="card-title mb-4">Performance Trends</h5>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="date" stroke="#666" />
          <YAxis stroke="#666" />
          <Tooltip />
          <Line type="monotone" dataKey="sales" stroke="#0d6efd" />
          <Line type="monotone" dataKey="orders" stroke="#198754" />
        </LineChart>
      </ResponsiveContainer>
    </Card.Body>
  </Card>
);

export default SellerChart;
