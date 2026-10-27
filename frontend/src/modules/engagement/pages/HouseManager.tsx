import React from 'react';
import { Box, Typography, Card, CardContent, Button, Table, TableBody, TableCell, TableHead, TableRow, Grid, Chip } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const HouseManager: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>House Manager</Typography>
        <Button variant="contained">Award Points</Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { name: 'Gryffindor', points: 1450, color: 'error.main' },
          { name: 'Slytherin', points: 1320, color: 'success.main' },
          { name: 'Ravenclaw', points: 1210, color: 'info.main' },
          { name: 'Hufflepuff', points: 1100, color: 'warning.main' },
        ].map((house) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={house.name}>
            <Card sx={{ borderTop: 4, borderColor: house.color, borderRadius: 2 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <EmojiEventsIcon sx={{ color: house.color, fontSize: 40, mb: 1 }} />
                <Typography variant="h6">{house.name}</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>{house.points}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" sx={{ mb: 2 }}>Recent Point Transactions</Typography>
      <Card sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>House</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell align="right">Points</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Oct 15, 2026</TableCell>
              <TableCell><Chip label="Gryffindor" size="small" color="error" variant="outlined"/></TableCell>
              <TableCell>Sports</TableCell>
              <TableCell>Won Inter-house Football</TableCell>
              <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'bold' }}>+50</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Oct 14, 2026</TableCell>
              <TableCell><Chip label="Slytherin" size="small" color="success" variant="outlined"/></TableCell>
              <TableCell>Academic</TableCell>
              <TableCell>Science Fair Winner</TableCell>
              <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'bold' }}>+40</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
};

export default HouseManager;
