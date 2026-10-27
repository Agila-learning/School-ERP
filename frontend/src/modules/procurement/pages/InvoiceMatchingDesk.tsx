import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Divider, Alert } from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

const InvoiceMatchingDesk: React.FC = () => {
  const matchData = {
    invoiceNumber: 'INV-99283',
    poNumber: 'PO-2026-0001',
    grnNumber: 'GRN-2026-0001',
    status: 'DISCREPANCY',
    items: [
      {
        name: 'Office Chairs',
        poQty: 50, poPrice: 100,
        grnQty: 45,
        invQty: 50, invPrice: 100,
        qtyMismatch: true,
        priceMismatch: false
      }
    ]
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CompareArrowsIcon fontSize="large" color="primary" />
          3-Way Invoice Matching
        </Typography>
        <Button variant="contained" color="primary" disabled={matchData.status === 'DISCREPANCY'}>
          Approve for Payment
        </Button>
      </Box>

      {matchData.status === 'DISCREPANCY' && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Discrepancy detected! Invoice quantity exceeds received goods quantity. Manual override or vendor credit required.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Purchase Order */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Purchase Order ({matchData.poNumber})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {matchData.items.map((item, idx) => (
                <Box key={idx} sx={{ mb: 1 }}>
                  <Typography variant="body1"><strong>Item:</strong> {item.name}</Typography>
                  <Typography variant="body2">Ordered Qty: {item.poQty}</Typography>
                  <Typography variant="body2">Unit Price: ${item.poPrice}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Goods Receipt */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="secondary" gutterBottom>
                Goods Receipt ({matchData.grnNumber})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {matchData.items.map((item, idx) => (
                <Box key={idx} sx={{ mb: 1 }}>
                  <Typography variant="body1"><strong>Item:</strong> {item.name}</Typography>
                  <Typography variant="body2" color={item.qtyMismatch ? 'error' : 'textPrimary'}>
                    Received Qty: {item.grnQty}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Condition: Good</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Supplier Invoice */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={3} sx={{ border: matchData.status === 'DISCREPANCY' ? '2px solid red' : 'none' }}>
            <CardContent>
              <Typography variant="h6" color="error" gutterBottom>
                Supplier Invoice ({matchData.invoiceNumber})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {matchData.items.map((item, idx) => (
                <Box key={idx} sx={{ mb: 1 }}>
                  <Typography variant="body1"><strong>Item:</strong> {item.name}</Typography>
                  <Typography variant="body2" color={item.qtyMismatch ? 'error' : 'textPrimary'} sx={{ fontWeight: item.qtyMismatch ? 'bold' : 'normal' }}>
                    Billed Qty: {item.invQty}
                  </Typography>
                  <Typography variant="body2" color={item.priceMismatch ? 'error' : 'textPrimary'}>
                    Billed Price: ${item.invPrice}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InvoiceMatchingDesk;
