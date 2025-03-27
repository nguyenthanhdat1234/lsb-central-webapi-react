import React, { useState, useEffect } from 'react';
import { Card, Table } from 'react-bootstrap';

const ClientManager = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5655/api/Clients');
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        const data = await response.json();
        setClients(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching client data:", err);
        setError("Không thể tải dữ liệu khách hàng. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format date từ timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Xác định trạng thái kết nối dựa trên lastHandshake
  const getConnectionStatus = (lastHandshake) => {
    if (!lastHandshake) return 'danger';
    
    const handshakeTime = new Date(lastHandshake);
    const now = new Date();
    const diffHours = (now - handshakeTime) / (1000 * 60 * 60);
    
    if (diffHours < 1) return 'success';  // Kết nối trong vòng 1 giờ
    if (diffHours < 24) return 'warning'; // Kết nối trong vòng 24 giờ
    return 'danger';  // Không kết nối > 24 giờ
  };

  if (loading) return <div className="text-center p-5">Đang tải dữ liệu...</div>;
  if (error) return <div className="text-center p-5 text-danger">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="mb-4">Client Manager</h2>
      
      <Card className="bg-dark text-white border-secondary">
        <Card.Body className="p-0">
          <Table variant="dark" bordered hover responsive>
            <thead>
              <tr className="bg-secondary">
                <th style={{ width: '40px' }}></th>
                <th>Client ID</th>
                <th>Client Name</th>
                <th>Last Handshake</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.clientId}>
                  <td className="text-center">
                    <div
                      className={`rounded-circle bg-${getConnectionStatus(client.lastHandshake)}`}
                      style={{ width: '20px', height: '20px', margin: '0 auto' }}
                    ></div>
                  </td>
                  <td>{client.clientId.substring(0, 8)}...</td>
                  <td>{client.clientName}</td>
                  <td>{formatDate(client.lastHandshake)}</td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center">Không có dữ liệu</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ClientManager;