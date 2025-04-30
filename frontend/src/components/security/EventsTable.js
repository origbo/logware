import React, { useState } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, Paper, Chip, IconButton,
  Tooltip, Typography, CircularProgress
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  ErrorOutline as ErrorIcon,
  WarningAmber as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const EventsTable = ({ events, loading, onRefresh }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewEvent = (eventId) => {
    navigate(`/admin/security/events/${eventId}`);
  };

  // Get status icon and color
  const getStatusInfo = (status) => {
    switch (status) {
      case 'threat':
        return { 
          icon: <ErrorIcon fontSize="small" />, 
          color: 'error',
          label: 'Threat'
        };
      case 'suspicious':
        return { 
          icon: <WarningIcon fontSize="small" />, 
          color: 'warning',
          label: 'Suspicious'
        };
      case 'analyzing':
        return { 
          icon: <InfoIcon fontSize="small" />, 
          color: 'info',
          label: 'Analyzing'
        };
      case 'normal':
        return { 
          icon: <CheckIcon fontSize="small" />, 
          color: 'success',
          label: 'Normal'
        };
      default:
        return { 
          icon: <InfoIcon fontSize="small" />, 
          color: 'default',
          label: status || 'Unknown'
        };
    }
  };

  return (
    <Paper>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <Tooltip title="Refresh">
          <IconButton onClick={onRefresh} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
          </IconButton>
        </Tooltip>
      </Box>
      
      <TableContainer component={Paper} sx={{ maxHeight: '60vh' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Status</TableCell>
              <TableCell>Timestamp</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Event Type</TableCell>
              <TableCell>Host</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Anomaly Score</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={40} />
                  <Typography sx={{ mt: 2 }}>Loading events...</Typography>
                </TableCell>
              </TableRow>
            ) : events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">No events found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              events
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((event) => {
                  const statusInfo = getStatusInfo(event.status);
                  
                  return (
                    <TableRow key={event._id} hover>
                      <TableCell>
                        <Chip 
                          icon={statusInfo.icon}
                          label={statusInfo.label}
                          color={statusInfo.color}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {moment(event.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                      </TableCell>
                      <TableCell>{event.source}</TableCell>
                      <TableCell>{event.category}</TableCell>
                      <TableCell>{event.eventType}</TableCell>
                      <TableCell>
                        {event.host?.hostname || '-'}
                      </TableCell>
                      <TableCell>
                        {event.user?.name || '-'}
                      </TableCell>
                      <TableCell>
                        {event.analysis?.anomalyScore !== undefined ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {event.analysis.anomalyScore}
                            {event.analysis.anomalyScore >= 80 && (
                              <ErrorIcon color="error" fontSize="small" sx={{ ml: 1 }} />
                            )}
                            {event.analysis.anomalyScore >= 60 && event.analysis.anomalyScore < 80 && (
                              <WarningIcon color="warning" fontSize="small" sx={{ ml: 1 }} />
                            )}
                          </Box>
                        ) : '-'}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small"
                            onClick={() => handleViewEvent(event._id)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={events.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default EventsTable;
