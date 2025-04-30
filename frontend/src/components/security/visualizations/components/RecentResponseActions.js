import React, { useState } from 'react';
import { 
  Box, Typography, Card, CardHeader, CardContent, 
  Divider, Chip, IconButton, Tooltip, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, Button
} from '@mui/material';

import {
  Refresh as RefreshIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Visibility as ViewIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

import moment from 'moment';

/**
 * RecentResponseActions Component
 * Displays recent automated actions taken by the system
 */
const RecentResponseActions = ({ responses = [], onRefresh }) => {
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // Handle view details
  const handleViewDetails = (response) => {
    setSelectedResponse(response);
    setDetailsOpen(true);
  };
  
  // Close details dialog
  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };
  
  // Format anomaly type for display
  const formatAnomalyType = (type) => {
    return type?.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ') || 'Unknown';
  };
  
  // Get status chip color
  const getStatusColor = (status) => {
    return status ? 'success' : 'error';
  };
  
  // Format action type for display
  const formatActionType = (actionType) => {
    return actionType?.split(/(?=[A-Z])/).map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ') || 'Unknown';
  };
  
  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'error';
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };
  
  return (
    <>
      <Card>
        <CardHeader 
          title="Recent Automated Actions" 
          subheader="Actions taken automatically in response to security events"
          avatar={<SecurityIcon />}
          action={
            <Tooltip title="Refresh Data">
              <IconButton onClick={onRefresh}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          }
        />
        <Divider />
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>Rule</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Anomaly Type</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {responses.length > 0 ? (
                  responses.map((response) => (
                    <TableRow key={response.id} hover>
                      <TableCell>{moment(response.timestamp).format('YYYY-MM-DD HH:mm')}</TableCell>
                      <TableCell>
                        <Tooltip title={response.ruleName}>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                            {response.ruleName}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{formatActionType(response.actionType)}</TableCell>
                      <TableCell>{formatAnomalyType(response.anomalyType)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={response.anomalySeverity?.toUpperCase() || 'N/A'} 
                          size="small"
                          color={getSeverityColor(response.anomalySeverity)}
                        />
                      </TableCell>
                      <TableCell>
                        {response.status === 'completed' || response.success ? (
                          <Tooltip title="Successful">
                            <SuccessIcon color="success" />
                          </Tooltip>
                        ) : (
                          <Tooltip title="Failed">
                            <ErrorIcon color="error" />
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small"
                          onClick={() => handleViewDetails(response)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No recent automated actions
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        {selectedResponse && (
          <>
            <DialogTitle>
              Automated Response Details
            </DialogTitle>
            <DialogContent dividers>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" scope="row" width="30%">Action ID</TableCell>
                      <TableCell>{selectedResponse.id}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">Rule Name</TableCell>
                      <TableCell>{selectedResponse.ruleName}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">Action Type</TableCell>
                      <TableCell>{formatActionType(selectedResponse.actionType)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">Timestamp</TableCell>
                      <TableCell>{moment(selectedResponse.timestamp).format('YYYY-MM-DD HH:mm:ss')}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">Status</TableCell>
                      <TableCell>
                        <Chip 
                          label={selectedResponse.status === 'completed' || selectedResponse.success ? 'Success' : 'Failed'} 
                          size="small"
                          color={getStatusColor(selectedResponse.status === 'completed' || selectedResponse.success)}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">Anomaly Type</TableCell>
                      <TableCell>{formatAnomalyType(selectedResponse.anomalyType)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">Anomaly Severity</TableCell>
                      <TableCell>
                        <Chip 
                          label={selectedResponse.anomalySeverity?.toUpperCase() || 'N/A'} 
                          size="small"
                          color={getSeverityColor(selectedResponse.anomalySeverity)}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">User</TableCell>
                      <TableCell>{selectedResponse.username || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">Execution Time</TableCell>
                      <TableCell>{selectedResponse.duration ? `${selectedResponse.duration}ms` : 'N/A'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {selectedResponse.actionResult?.details && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>Action Details</Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableBody>
                        {Object.entries(selectedResponse.actionResult.details).map(([key, value]) => (
                          <TableRow key={key}>
                            <TableCell component="th" scope="row" width="30%">
                              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                            </TableCell>
                            <TableCell>{typeof value === 'object' ? JSON.stringify(value) : value.toString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
};

export default RecentResponseActions;
