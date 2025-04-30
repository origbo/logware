import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Tabs, 
  Tab,
  Card, 
  CardContent, 
  TextField, 
  MenuItem, 
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  ZoomIn,
  ZoomOut,
  Refresh,
  FilterList,
  MoreVert as MoreIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Mock API call to fetch network topology data
const fetchNetworkData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        nodes: [
          { id: 1, type: 'router', label: 'Core Router', ip: '192.168.1.1', status: 'active', connections: [2, 3, 4] },
          { id: 2, type: 'switch', label: 'Switch A', ip: '192.168.1.2', status: 'active', connections: [1, 5, 6] },
          { id: 3, type: 'switch', label: 'Switch B', ip: '192.168.1.3', status: 'active', connections: [1, 7, 8] },
          { id: 4, type: 'firewall', label: 'Main Firewall', ip: '192.168.1.4', status: 'active', connections: [1, 9] },
          { id: 5, type: 'server', label: 'Web Server', ip: '192.168.1.5', status: 'active', connections: [2] },
          { id: 6, type: 'server', label: 'Database Server', ip: '192.168.1.6', status: 'active', connections: [2] },
          { id: 7, type: 'server', label: 'File Server', ip: '192.168.1.7', status: 'warning', connections: [3] },
          { id: 8, type: 'workstation', label: 'Admin PC', ip: '192.168.1.8', status: 'active', connections: [3] },
          { id: 9, type: 'gateway', label: 'Internet Gateway', ip: '192.168.1.9', status: 'active', connections: [4] },
          { id: 10, type: 'workstation', label: 'User PC 1', ip: '192.168.1.10', status: 'inactive', connections: [2] },
          { id: 11, type: 'workstation', label: 'User PC 2', ip: '192.168.1.11', status: 'active', connections: [3] },
          { id: 12, type: 'workstation', label: 'User PC 3', ip: '192.168.1.12', status: 'active', connections: [3] }
        ],
        links: [
          { source: 1, target: 2, status: 'active', bandwidth: '1 Gbps' },
          { source: 1, target: 3, status: 'active', bandwidth: '1 Gbps' },
          { source: 1, target: 4, status: 'active', bandwidth: '10 Gbps' },
          { source: 2, target: 5, status: 'active', bandwidth: '1 Gbps' },
          { source: 2, target: 6, status: 'active', bandwidth: '1 Gbps' },
          { source: 2, target: 10, status: 'inactive', bandwidth: '100 Mbps' },
          { source: 3, target: 7, status: 'warning', bandwidth: '1 Gbps' },
          { source: 3, target: 8, status: 'active', bandwidth: '1 Gbps' },
          { source: 3, target: 11, status: 'active', bandwidth: '100 Mbps' },
          { source: 3, target: 12, status: 'active', bandwidth: '100 Mbps' },
          { source: 4, target: 9, status: 'active', bandwidth: '10 Gbps' }
        ]
      });
    }, 1500);
  });
};

const NetworkMap = () => {
  const [networkData, setNetworkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [moreAnchorEl, setMoreAnchorEl] = useState(null);
  const [filter, setFilter] = useState({
    types: ['all'],
    status: ['active', 'warning', 'inactive']
  });
  
  const canvasRef = useRef(null);
  const theme = useTheme();
  
  useEffect(() => {
    const loadNetworkData = async () => {
      try {
        const data = await fetchNetworkData();
        setNetworkData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error loading network data:', error);
        setLoading(false);
      }
    };
    
    loadNetworkData();
  }, []);
  
  useEffect(() => {
    if (networkData && canvasRef.current) {
      renderNetworkMap();
    }
  }, [networkData, zoomLevel, filter]);
  
  const renderNetworkMap = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Apply filters
    const filteredNodes = filter.types.includes('all') 
      ? networkData.nodes.filter(node => filter.status.includes(node.status))
      : networkData.nodes.filter(node => 
          filter.types.includes(node.type) && filter.status.includes(node.status)
        );
    
    const nodeIds = filteredNodes.map(node => node.id);
    const filteredLinks = networkData.links.filter(link => 
      nodeIds.includes(link.source) && nodeIds.includes(link.target)
    );
    
    // Position nodes (simplified layout algorithm)
    const nodePositions = {};
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.4 * zoomLevel;
    
    // Position nodes in a circle
    filteredNodes.forEach((node, index) => {
      const angle = (index / filteredNodes.length) * Math.PI * 2;
      nodePositions[node.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });
    
    // Draw links
    filteredLinks.forEach(link => {
      const sourcePos = nodePositions[link.source];
      const targetPos = nodePositions[link.target];
      
      if (sourcePos && targetPos) {
        ctx.beginPath();
        ctx.moveTo(sourcePos.x, sourcePos.y);
        ctx.lineTo(targetPos.x, targetPos.y);
        
        // Set line style based on status
        if (link.status === 'active') {
          ctx.strokeStyle = theme.palette.success.main;
        } else if (link.status === 'warning') {
          ctx.strokeStyle = theme.palette.warning.main;
        } else {
          ctx.strokeStyle = theme.palette.error.main;
        }
        
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
    
    // Draw nodes
    filteredNodes.forEach(node => {
      const pos = nodePositions[node.id];
      const radius = 20 * zoomLevel;
      
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      
      // Set fill color based on type and status
      let fillColor;
      if (node.status === 'active') {
        switch (node.type) {
          case 'router':
            fillColor = theme.palette.primary.main;
            break;
          case 'switch':
            fillColor = theme.palette.secondary.main;
            break;
          case 'server':
            fillColor = theme.palette.info.main;
            break;
          case 'firewall':
            fillColor = theme.palette.error.main;
            break;
          case 'gateway':
            fillColor = theme.palette.warning.main;
            break;
          default:
            fillColor = theme.palette.grey[500];
        }
      } else if (node.status === 'warning') {
        fillColor = theme.palette.warning.main;
      } else {
        fillColor = theme.palette.grey[400];
      }
      
      ctx.fillStyle = fillColor;
      ctx.fill();
      
      // Node label
      ctx.fillStyle = theme.palette.text.primary;
      ctx.font = `${12 * zoomLevel}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(node.label, pos.x, pos.y + radius + 15 * zoomLevel);
    });
    
    // Handle node selection via click
    canvas.onclick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Check if a node was clicked
      let clickedNode = null;
      
      for (const node of filteredNodes) {
        const pos = nodePositions[node.id];
        const distance = Math.sqrt(
          Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2)
        );
        
        if (distance <= 20 * zoomLevel) {
          clickedNode = node;
          break;
        }
      }
      
      setSelectedNode(clickedNode);
    };
  };
  
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };
  
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const data = await fetchNetworkData();
      setNetworkData(data);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };
  
  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };
  
  const handleMoreClick = (event) => {
    setMoreAnchorEl(event.currentTarget);
  };
  
  const handleMoreClose = () => {
    setMoreAnchorEl(null);
  };
  
  const handleFilterChange = (type, value) => {
    setFilter(prev => {
      if (type === 'types') {
        if (value === 'all') {
          return { ...prev, types: ['all'] };
        } else {
          const newTypes = prev.types.includes(value)
            ? prev.types.filter(t => t !== value)
            : [...prev.types.filter(t => t !== 'all'), value];
          return { ...prev, types: newTypes.length ? newTypes : ['all'] };
        }
      } else {
        const newStatus = prev.status.includes(value)
          ? prev.status.filter(s => s !== value)
          : [...prev.status, value];
        return { ...prev, status: newStatus };
      }
    });
  };
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Network Map
        </Typography>
        <Box>
          <Tooltip title="Filter">
            <IconButton onClick={handleFilterClick}>
              <FilterList />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom In">
            <IconButton onClick={handleZoomIn}>
              <ZoomIn />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom Out">
            <IconButton onClick={handleZoomOut}>
              <ZoomOut />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : <Refresh />}
            </IconButton>
          </Tooltip>
          <Tooltip title="More Actions">
            <IconButton onClick={handleMoreClick}>
              <MoreIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={9}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 2, 
              height: '70vh',
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 2,
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}
          >
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              sx={{ mb: 2 }}
            >
              <Tab label="Topology" />
              <Tab label="Traffic" />
              <Tab label="Alerts" />
            </Tabs>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ position: 'relative', flex: 1 }}>
                <canvas 
                  ref={canvasRef} 
                  width={800} 
                  height={600}
                  style={{ width: '100%', height: '100%' }}
                />
                
                <Box sx={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', gap: 1 }}>
                  <Chip 
                    label="Router" 
                    sx={{ bgcolor: theme.palette.primary.main, color: 'white' }} 
                    size="small"
                  />
                  <Chip 
                    label="Switch" 
                    sx={{ bgcolor: theme.palette.secondary.main, color: 'white' }} 
                    size="small"
                  />
                  <Chip 
                    label="Server" 
                    sx={{ bgcolor: theme.palette.info.main, color: 'white' }} 
                    size="small"
                  />
                  <Chip 
                    label="Firewall" 
                    sx={{ bgcolor: theme.palette.error.main, color: 'white' }} 
                    size="small"
                  />
                  <Chip 
                    label="Other" 
                    sx={{ bgcolor: theme.palette.grey[500], color: 'white' }} 
                    size="small"
                  />
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper
            elevation={0}
            sx={{ 
              p: 2, 
              height: '70vh', 
              borderRadius: 2,
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}
          >
            <Typography variant="h6" gutterBottom>
              Network Details
            </Typography>
            
            {selectedNode ? (
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {selectedNode.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1)}
                  </Typography>
                  
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      <strong>IP Address:</strong> {selectedNode.ip}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Status:</strong> {' '}
                      <Chip 
                        label={selectedNode.status.charAt(0).toUpperCase() + selectedNode.status.slice(1)} 
                        color={
                          selectedNode.status === 'active' ? 'success' : 
                          selectedNode.status === 'warning' ? 'warning' : 'error'
                        }
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                    <Typography variant="body2">
                      <strong>Connections:</strong> {selectedNode.connections.length}
                    </Typography>
                  </Box>
                  
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    fullWidth
                    size="small"
                    sx={{ mt: 2 }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Click on a node to view details
              </Typography>
            )}
            
            <Typography variant="subtitle1" gutterBottom>
              Network Statistics
            </Typography>
            
            {!loading && networkData && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Total Devices:</strong> {networkData.nodes.length}
                </Typography>
                <Typography variant="body2">
                  <strong>Active Devices:</strong> {networkData.nodes.filter(n => n.status === 'active').length}
                </Typography>
                <Typography variant="body2">
                  <strong>Inactive Devices:</strong> {networkData.nodes.filter(n => n.status === 'inactive').length}
                </Typography>
                <Typography variant="body2">
                  <strong>Warning Devices:</strong> {networkData.nodes.filter(n => n.status === 'warning').length}
                </Typography>
              </Box>
            )}
            
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
            >
              Network Scan
            </Button>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
          Device Type
        </Typography>
        <MenuItem 
          onClick={() => handleFilterChange('types', 'all')}
          selected={filter.types.includes('all')}
        >
          <ListItemText>All Types</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => handleFilterChange('types', 'router')}
          selected={filter.types.includes('router')}
        >
          <ListItemText>Routers</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => handleFilterChange('types', 'switch')}
          selected={filter.types.includes('switch')}
        >
          <ListItemText>Switches</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => handleFilterChange('types', 'server')}
          selected={filter.types.includes('server')}
        >
          <ListItemText>Servers</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => handleFilterChange('types', 'workstation')}
          selected={filter.types.includes('workstation')}
        >
          <ListItemText>Workstations</ListItemText>
        </MenuItem>
        
        <Typography variant="subtitle2" sx={{ px: 2, py: 1, mt: 1 }}>
          Status
        </Typography>
        <MenuItem 
          onClick={() => handleFilterChange('status', 'active')}
          selected={filter.status.includes('active')}
        >
          <ListItemText>Active</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => handleFilterChange('status', 'warning')}
          selected={filter.status.includes('warning')}
        >
          <ListItemText>Warning</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => handleFilterChange('status', 'inactive')}
          selected={filter.status.includes('inactive')}
        >
          <ListItemText>Inactive</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* More Actions Menu */}
      <Menu
        anchorEl={moreAnchorEl}
        open={Boolean(moreAnchorEl)}
        onClose={handleMoreClose}
      >
        <MenuItem onClick={handleMoreClose}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as PNG</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMoreClose}>
          <ListItemIcon>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Print Network Map</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMoreClose}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share Network Map</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default NetworkMap;
