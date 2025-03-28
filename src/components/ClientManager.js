import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Badge, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { API_BASE_URL } from '../config/apiConfig';
import { formatDate } from '../utils/dateUtils';
import { FaUsers, FaCopy } from 'react-icons/fa';

const ClientManager = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedClientId, setExpandedClientId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/Clients`);
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        const data = await response.json();
        setClients(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching client data:", err);
        setError("Unable to load client data. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getConnectionStatus = (lastHandshake) => {
    if (!lastHandshake) return 'danger';
    
    const handshakeTime = new Date(lastHandshake);
    const now = new Date();
    const diffHours = (now - handshakeTime) / (1000 * 60 * 60);
    
    if (diffHours < 1) return 'success';
    if (diffHours < 24) return 'warning';
    return 'danger';
  };
  
  const getStatusText = (status) => {
    switch(status) {
      case 'success': return 'Online';
      case 'warning': return 'Idle';
      case 'danger': return 'Offline';
      default: return 'Unknown';
    }
  };

  const handleClientIdClick = (clientId) => {
    if (expandedClientId === clientId) {
      setExpandedClientId(null);
    } else {
      setExpandedClientId(clientId);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        console.log('Copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  // Count clients by status
  const onlineCount = clients.filter(client => getConnectionStatus(client.lastHandshake) === 'success').length;
  const idleCount = clients.filter(client => getConnectionStatus(client.lastHandshake) === 'warning').length;
  const offlineCount = clients.filter(client => getConnectionStatus(client.lastHandshake) === 'danger').length;

  if (loading) return <div className="text-center p-5" style={{background: 'white'}}>Loading data...</div>;
  if (error) return <div className="text-center p-5 text-danger" style={{background: 'white'}}>{error}</div>;

  return (
    <div style={{
      background: 'white', 
      minHeight: '100vh', 
      padding: '20px',
      color: '#333'
    }}>
      <Container fluid style={{maxWidth: '1200px'}}>
        {/* Header */}
        <Row className="mb-3 align-items-center">
          <Col>
            <h2 className="d-flex align-items-center" style={{color: '#0d6efd', margin: 0}}>
              <FaUsers className="me-2" /> Client Manager
            </h2>
          </Col>
          <Col xs="auto">
            <Badge bg="success" className="me-2" style={{fontSize: '14px', padding: '8px 12px'}}>
              Online: {onlineCount}
            </Badge>
            <Badge bg="warning" className="me-2" style={{fontSize: '14px', padding: '8px 12px'}}>
              Idle: {idleCount}
            </Badge>
            <Badge bg="danger" style={{fontSize: '14px', padding: '8px 12px'}}>
              Offline: {offlineCount}
            </Badge>
          </Col>
        </Row>

        {/* Main Content */}
        <div style={{
          background: 'white',
          border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: '5px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '15px',
            borderBottom: '1px solid rgba(0,0,0,0.1)',
            fontWeight: 'bold',
            color: '#0d6efd'
          }}>
            Client Status Overview
          </div>
          
          <Table responsive hover style={{margin: 0}}>
            <thead>
              <tr style={{borderBottom: '1px solid rgba(0,0,0,0.1)'}}>
                <th style={{padding: '12px 15px', fontWeight: '600'}}>Status</th>
                <th style={{padding: '12px 15px', fontWeight: '600'}}>Client ID</th>
                <th style={{padding: '12px 15px', fontWeight: '600'}}>Client Name</th>
                <th style={{padding: '12px 15px', fontWeight: '600'}}>Last Handshake</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => {
                const status = getConnectionStatus(client.lastHandshake);
                const statusText = getStatusText(status);
                const isExpanded = expandedClientId === client.clientId;
                
                return (
                  <tr key={client.clientId} style={{borderBottom: '1px solid rgba(0,0,0,0.05)'}}>
                    <td style={{padding: '12px 15px', verticalAlign: 'middle'}}>
                      <div style={{display: 'flex', alignItems: 'center'}}>
                        <span 
                          style={{
                            width: '8px', 
                            height: '8px', 
                            borderRadius: '50%', 
                            display: 'inline-block',
                            backgroundColor: status === 'success' 
                              ? '#198754' 
                              : status === 'warning' 
                                ? '#ffc107' 
                                : '#dc3545',
                            marginRight: '8px'
                          }}
                        ></span>
                        {statusText}
                      </div>
                    </td>
                    <td style={{padding: '12px 15px', verticalAlign: 'middle'}}>
                      <div style={{display: 'flex', alignItems: 'center'}}>
                        <span 
                          style={{
                            display: 'inline-block', 
                            padding: '4px 8px', 
                            backgroundColor: '#f8f9fa',
                            borderRadius: '4px',
                            border: '1px solid rgba(0,0,0,0.1)',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                          onClick={() => handleClientIdClick(client.clientId)}
                        >
                          {isExpanded ? client.clientId : `${client.clientId.substring(0, 8)}...`}
                        </span>
                        
                        {isExpanded && (
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Copy Client ID</Tooltip>}
                          >
                            <span 
                              style={{
                                marginLeft: '10px', 
                                cursor: 'pointer', 
                                color: '#0d6efd'
                              }}
                              onClick={() => copyToClipboard(client.clientId)}
                            >
                              <FaCopy />
                            </span>
                          </OverlayTrigger>
                        )}
                      </div>
                    </td>
                    <td style={{padding: '12px 15px', verticalAlign: 'middle'}}>
                      <div style={{display: 'flex', alignItems: 'center'}}>
                        <span style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(13, 110, 253, 0.1)',
                          color: '#0d6efd',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '10px',
                          fontWeight: 'bold'
                        }}>
                          {client.clientName.charAt(0).toUpperCase()}
                        </span>
                        {client.clientName}
                      </div>
                    </td>
                    <td style={{padding: '12px 15px', verticalAlign: 'middle'}}>
                      {formatDate(client.lastHandshake) || 'Never'}
                    </td>
                  </tr>
                );
              })}
              {clients.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center" style={{padding: '20px'}}>
                    No client data available
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Container>
    </div>
  );
};

export default ClientManager;