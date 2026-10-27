import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, ListItemSecondaryAction, Button, Chip } from '@mui/material';

export default function DocumentApprovalBoard() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="600" mb={3}>Document Approval Board</Typography>

      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <List>
          <ListItem divider>
            <ListItemText 
              primary="Experience_Letter.pdf" 
              secondary="Uploaded by: Jane Smith • Type: Experience Certificate" 
            />
            <ListItemSecondaryAction>
              <Button size="small" variant="outlined" color="error" sx={{ mr: 1 }}>Reject</Button>
              <Button size="small" variant="contained" color="success" disableElevation>Approve</Button>
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Medical_Report.jpg" 
              secondary="Uploaded by: Rahul Kumar • Type: Medical Certificate" 
            />
            <ListItemSecondaryAction>
              <Button size="small" variant="outlined" color="error" sx={{ mr: 1 }}>Reject</Button>
              <Button size="small" variant="contained" color="success" disableElevation>Approve</Button>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
}
