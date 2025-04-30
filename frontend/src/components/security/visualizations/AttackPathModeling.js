import React, { useState } from 'react';
import { Card, CardHeader, CardContent, Divider, Box, Typography, FormControl, InputLabel, Select, MenuItem, useTheme, Paper, Grid } from '@mui/material';

/**
 * Attack Path Modeling Component
 * Simplified visualization of potential attack paths through the system based on vulnerability data
 */
const AttackPathModeling = ({ data, title }) => {
  const theme = useTheme();
  const [selectedAsset, setSelectedAsset] = useState('all');
  
  // Generate mock data if no data provided
  const graphData = data || generateMockData();
  
  // Filter nodes based on selected asset
  const filteredNodes = React.useMemo(() => {
    if (selectedAsset === 'all') {
      return graphData.nodes;
    }
    
    // Get connected nodes (simplified)
    const connectedNodeIds = new Set([selectedAsset]);
    
    // Add directly connected nodes
    graphData.links.forEach(link => {
      if (link.source === selectedAsset) {
        connectedNodeIds.add(link.target);
      } else if (link.target === selectedAsset) {
        connectedNodeIds.add(link.source);
      }
    });
    
    return graphData.nodes.filter(node => connectedNodeIds.has(node.id));
  }, [graphData, selectedAsset]);
  
  // Get relevant links
  const filteredLinks = React.useMemo(() => {
    if (selectedAsset === 'all') {
      return graphData.links;
    }
    
    const nodeIds = new Set(filteredNodes.map(node => node.id));
    return graphData.links.filter(link => 
      nodeIds.has(link.source) && nodeIds.has(link.target)
    );
  }, [graphData, filteredNodes, selectedAsset]);
  
  // Get node color based on type and risk
  const getNodeColor = (node) => {
    if (node.type === 'asset') {
      return node.criticality === 'high' ? theme.palette.error.main :
             node.criticality === 'medium' ? theme.palette.warning.main :
             theme.palette.success.main;
    } else if (node.type === 'user') {
      return node.riskLevel === 'high' ? theme.palette.error.dark :
             node.riskLevel === 'medium' ? theme.palette.warning.dark :
             theme.palette.info.main;
    } else if (node.type === 'entry') {
      return theme.palette.secondary.main;
    }
    return theme.palette.grey[500];
  };
  
  // Get link color based on weight
  const getLinkColor = (weight) => {
    return weight > 0.7 ? theme.palette.error.light :
           weight > 0.4 ? theme.palette.warning.light :
           theme.palette.grey[400];
  };
  
  return (
    <Card sx={{ width: '100%', height: '100%', minHeight: 500 }}>
      <CardHeader 
        title={title || "Attack Path Modeling"}
        action={
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150, mt: 0.5 }}>
            <InputLabel id="asset-select-label">Focus Asset</InputLabel>
            <Select
              labelId="asset-select-label"
              id="asset-select"
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              label="Focus Asset"
            >
              <MenuItem value="all">All Assets</MenuItem>
              {graphData.nodes
                .filter(node => node.type === 'asset')
                .map(node => (
                  <MenuItem key={node.id} value={node.id}>
                    {node.name}
                  </MenuItem>
                ))
              }
            </Select>
          </FormControl>
        }
      />
      <Divider />
      <CardContent sx={{ p: 2, height: 'calc(100% - 76px)', minHeight: 450 }}>
        {filteredNodes.length > 0 ? (
          <>
            <Typography variant="subtitle1" gutterBottom>
              Showing {filteredNodes.length} nodes and {filteredLinks.length} connections
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {/* Network Nodes */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Network Elements</Typography>
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {filteredNodes.map(node => (
                    <Paper 
                      key={node.id} 
                      elevation={3} 
                      sx={{ 
                        p: 2, 
                        mb: 2, 
                        borderLeft: `4px solid ${getNodeColor(node)}`,
                        backgroundColor: `${getNodeColor(node)}15`
                      }}
                    >
                      <Typography variant="subtitle1">
                        {node.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Type: {node.type === 'asset' ? node.assetType : 
                              node.type === 'user' ? node.role : 
                              node.entryType}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {node.type === 'asset' ? 
                          `Criticality: ${node.criticality}, Vulnerability: ${node.vulnerabilityScore}` : 
                          node.type === 'user' ? 
                          `Privilege: ${node.privilegeLevel}, Risk: ${node.riskLevel}` : 
                          `Exposure: ${node.exposureLevel}`}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              </Grid>
              
              {/* Network Connections */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Attack Vectors</Typography>
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {filteredLinks.map((link, index) => {
                    const sourceNode = graphData.nodes.find(n => n.id === link.source);
                    const targetNode = graphData.nodes.find(n => n.id === link.target);
                    return (
                      <Paper 
                        key={index} 
                        elevation={2} 
                        sx={{ 
                          p: 2, 
                          mb: 2, 
                          borderLeft: `4px solid ${getLinkColor(link.weight)}`,
                          backgroundColor: `${getLinkColor(link.weight)}15`
                        }}
                      >
                        <Typography variant="subtitle1">
                          {sourceNode?.name} → {targetNode?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Risk Factor: {Math.round(link.weight * 100)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {link.weight > 0.7 ? 'HIGH RISK PATH' : 
                           link.weight > 0.4 ? 'Medium Risk' : 'Low Risk'}
                        </Typography>
                      </Paper>
                    );
                  })}
                </Box>
              </Grid>
            </Grid>
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Typography variant="body1">No attack path data available</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Generate mock data for demonstration purposes
 */
function generateMockData() {
  // Create nodes for assets, users, and entry points
  const nodes = [
    // Entry points
    { id: 'entry1', name: 'External Website', type: 'entry', entryType: 'web', exposureLevel: 'high' },
    { id: 'entry2', name: 'VPN', type: 'entry', entryType: 'network', exposureLevel: 'medium' },
    { id: 'entry3', name: 'Email Gateway', type: 'entry', entryType: 'email', exposureLevel: 'high' },
    
    // Users
    { id: 'user1', name: 'Admin User', type: 'user', role: 'administrator', privilegeLevel: 0.9, riskLevel: 'high' },
    { id: 'user2', name: 'Regular User', type: 'user', role: 'employee', privilegeLevel: 0.4, riskLevel: 'low' },
    { id: 'user3', name: 'Developer', type: 'user', role: 'developer', privilegeLevel: 0.7, riskLevel: 'medium' },
    { id: 'user4', name: 'Contractor', type: 'user', role: 'external', privilegeLevel: 0.5, riskLevel: 'high' },
    
    // Assets
    { id: 'asset1', name: 'Web Server', type: 'asset', assetType: 'server', criticality: 'high', vulnerabilityScore: 0.6 },
    { id: 'asset2', name: 'Database Server', type: 'asset', assetType: 'database', criticality: 'high', vulnerabilityScore: 0.7 },
    { id: 'asset3', name: 'File Server', type: 'asset', assetType: 'storage', criticality: 'medium', vulnerabilityScore: 0.4 },
    { id: 'asset4', name: 'Domain Controller', type: 'asset', assetType: 'infrastructure', criticality: 'high', vulnerabilityScore: 0.5 },
    { id: 'asset5', name: 'Workstation', type: 'asset', assetType: 'endpoint', criticality: 'low', vulnerabilityScore: 0.8 },
    { id: 'asset6', name: 'IoT Devices', type: 'asset', assetType: 'iot', criticality: 'medium', vulnerabilityScore: 0.9 },
    { id: 'asset7', name: 'Cloud Storage', type: 'asset', assetType: 'cloud', criticality: 'medium', vulnerabilityScore: 0.3 },
  ];
  
  // Create links between nodes to represent attack paths
  const links = [
    // Entry points to assets
    { source: 'entry1', target: 'asset1', weight: 0.8 },
    { source: 'entry2', target: 'asset4', weight: 0.5 },
    { source: 'entry3', target: 'asset5', weight: 0.7 },
    
    // User access
    { source: 'user1', target: 'asset1', weight: 0.6 },
    { source: 'user1', target: 'asset2', weight: 0.8 },
    { source: 'user1', target: 'asset3', weight: 0.7 },
    { source: 'user1', target: 'asset4', weight: 0.9 },
    { source: 'user2', target: 'asset3', weight: 0.5 },
    { source: 'user2', target: 'asset5', weight: 0.6 },
    { source: 'user3', target: 'asset1', weight: 0.7 },
    { source: 'user3', target: 'asset2', weight: 0.4 },
    { source: 'user3', target: 'asset7', weight: 0.8 },
    { source: 'user4', target: 'asset6', weight: 0.9 },
    { source: 'user4', target: 'asset7', weight: 0.6 },
    
    // Asset to asset connections (lateral movement)
    { source: 'asset1', target: 'asset2', weight: 0.7 },
    { source: 'asset2', target: 'asset4', weight: 0.8 },
    { source: 'asset4', target: 'asset3', weight: 0.5 },
    { source: 'asset5', target: 'asset4', weight: 0.6 },
    { source: 'asset5', target: 'asset6', weight: 0.4 },
    { source: 'asset1', target: 'asset7', weight: 0.3 },
    { source: 'asset6', target: 'asset2', weight: 0.7 },
  ];
  
  return { nodes, links };
}

export default AttackPathModeling;
