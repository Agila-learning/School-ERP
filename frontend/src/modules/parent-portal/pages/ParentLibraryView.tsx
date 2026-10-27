import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell, 
  TableBody, Chip, CircularProgress, Button, Avatar, Grid, Card, CardContent,
  Alert, Tab, Tabs
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import BackButton from '../../../shared/components/BackButton';
import api from '../../../core/api/axios';
import { useParentContext } from '../context/ParentContext';

const ParentLibraryView: React.FC = () => {
  const { selectedChild, isLoading: isContextLoading } = useParentContext();
  const [libraryData, setLibraryData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (selectedChild) {
      setLoading(true);
      const sId = selectedChild.studentId || selectedChild._id;
      api.get(`/parent-portal/children/${sId}/library`)
        .then(res => setLibraryData(res.data?.data || null))
        .catch(err => {
          console.error('Failed to fetch library info', err);
          setLibraryData(null);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedChild]);

  if (isContextLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>;
  }

  if (!selectedChild) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        <BackButton to="/parent-portal" />
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid #e2e8f0', color: 'text.secondary' }}>
          No student selected or linked to your parent profile.
        </Paper>
      </Box>
    );
  }

  const issues = libraryData?.issues || [];
  const fines = libraryData?.fines || [];
  const activeIssues = issues.filter((i: any) => i.status === 'ACTIVE' || i.status === 'OVERDUE');
  const pastIssues = issues.filter((i: any) => i.status === 'RETURNED');
  const totalFinesDue = libraryData?.totalFinesDue ?? fines.reduce((sum: number, f: any) => sum + (f.status === 'PENDING' ? (f.netAmount || f.amount || 0) : 0), 0);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <BackButton to="/parent-portal" />
      
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <MenuBookIcon sx={{ fontSize: 36, color: '#6366f1' }} />
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Library & Book Tracker</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Track books borrowed, issue & due dates, return statuses, and library dues for {selectedChild.firstName}.
          </Typography>
        </Box>
        <Chip 
          avatar={<Avatar>{selectedChild.firstName?.charAt(0)}</Avatar>} 
          label={`${selectedChild.firstName} ${selectedChild.lastName} (${selectedChild.class || 'Class 10'} - ${selectedChild.section || 'A'})`} 
          sx={{ ml: 'auto', fontWeight: 600, bgcolor: 'white', border: '1px solid #e2e8f0' }} 
        />
      </Box>

      {/* Purpose Banner: Why does the Parent Dashboard have Library? */}
      <Alert 
        severity="info" 
        icon={<InfoOutlinedIcon fontSize="inherit" />}
        sx={{ 
          mb: 4, 
          borderRadius: 3, 
          border: '1px solid #c7d2fe', 
          bgcolor: '#eef2ff',
          color: '#312e81',
          '& .MuiAlert-icon': { color: '#6366f1' }
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
          Why is Library access essential on the Parent Dashboard?
        </Typography>
        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
          School library tracking enables parents to foster healthy reading habits, verify what academic textbooks or literature their child has checked out, monitor return due dates, and prevent accumulated late fees or dues.
        </Typography>
      </Alert>

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Currently Borrowed</Typography>
                <AutoStoriesIcon sx={{ color: '#3b82f6', fontSize: 24 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>{activeIssues.length}</Typography>
              <Typography variant="caption" color="text.secondary">Books in possession</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Overdue Books</Typography>
                <WarningAmberIcon sx={{ color: activeIssues.some((i: any) => i.status === 'OVERDUE') ? '#ef4444' : '#10b981', fontSize: 24 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: activeIssues.filter((i: any) => i.status === 'OVERDUE').length > 0 ? '#ef4444' : '#1e293b' }}>
                {activeIssues.filter((i: any) => i.status === 'OVERDUE').length}
              </Typography>
              <Typography variant="caption" color="text.secondary">Needs immediate return</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Library Dues / Fines</Typography>
                <AttachMoneyIcon sx={{ color: totalFinesDue > 0 ? '#f59e0b' : '#10b981', fontSize: 24 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: totalFinesDue > 0 ? '#d97706' : '#10b981' }}>
                ₹{totalFinesDue}
              </Typography>
              <Typography variant="caption" color="text.secondary">{totalFinesDue > 0 ? 'Pending overdue fee' : 'No dues pending'}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Read / Returned</Typography>
                <CheckCircleOutlineIcon sx={{ color: '#10b981', fontSize: 24 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#10b981' }}>{pastIssues.length}</Typography>
              <Typography variant="caption" color="text.secondary">Books completed this term</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden', mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={(_, v) => setActiveTab(v)}
          sx={{ borderBottom: '1px solid #e2e8f0', px: 2, bgcolor: '#ffffff' }}
        >
          <Tab label={`Active Borrowings (${activeIssues.length})`} sx={{ textTransform: 'none', fontWeight: 700 }} />
          <Tab label={`Dues & Fine Breakdown (${fines.length})`} sx={{ textTransform: 'none', fontWeight: 700 }} />
          <Tab label={`Borrowing History (${pastIssues.length})`} sx={{ textTransform: 'none', fontWeight: 700 }} />
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>
        ) : (
          <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* Tab 0: Active Borrowings */}
            {activeTab === 0 && (
              <Box>
                {activeIssues.length === 0 ? (
                  <Box sx={{ p: 6, textAlign: 'center', color: 'text.secondary' }}>
                    <AutoStoriesIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>No Active Books Borrowed</Typography>
                    <Typography variant="body2" color="text.secondary">Your child currently has no unreturned books from the library.</Typography>
                  </Box>
                ) : (
                  <Box sx={{ overflowX: 'auto' }}>
                    <Table>
                      <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Book Title & Details</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Accession / Barcode</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Issue Date (Taken)</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Due Date (Return)</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 700 }} align="right">Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {activeIssues.map((issue: any) => {
                          const isOverdue = issue.status === 'OVERDUE' || (new Date(issue.dueDate) < new Date());
                          return (
                            <TableRow key={issue._id} hover>
                              <TableCell>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                  {issue.bookId?.title || 'Library Book'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  ISBN: {issue.bookId?.isbn13 || issue.bookId?.isbn10 || 'N/A'} • {issue.bookId?.edition || 'Standard Edition'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  size="small" 
                                  label={issue.copyId?.accessionNumber || issue.copyId?.barcode || 'BC-00918'} 
                                  sx={{ fontFamily: 'monospace', fontWeight: 600, bgcolor: '#f1f5f9' }} 
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {new Date(issue.issueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    fontWeight: 700, 
                                    color: isOverdue ? '#ef4444' : '#1e293b' 
                                  }}
                                >
                                  {new Date(issue.dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                </Typography>
                                {isOverdue && (
                                  <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 700, display: 'block' }}>
                                    OVERDUE
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  size="small" 
                                  label={isOverdue ? 'OVERDUE' : 'ACTIVE / IN POSSESSION'} 
                                  color={isOverdue ? 'error' : 'success'} 
                                  sx={{ fontWeight: 700 }} 
                                />
                              </TableCell>
                              <TableCell align="right">
                                <Button 
                                  size="small" 
                                  variant="outlined" 
                                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                                  onClick={() => alert(`Renewal request sent for "${issue.bookId?.title || 'Book'}". Librarian will verify availability.`)}
                                >
                                  Request Renewal
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Box>
                )}
              </Box>
            )}

            {/* Tab 1: Dues & Fine Breakdown */}
            {activeTab === 1 && (
              <Box>
                {fines.length === 0 ? (
                  <Box sx={{ p: 6, textAlign: 'center', color: 'text.secondary' }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 48, color: '#10b981', mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>All Clear — No Library Dues</Typography>
                    <Typography variant="body2" color="text.secondary">There are no outstanding overdue book fines or lost charges.</Typography>
                  </Box>
                ) : (
                  <Box sx={{ overflowX: 'auto' }}>
                    <Table>
                      <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Fine Reason / Description</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Amount (₹)</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Date Imposed</TableCell>
                          <TableCell sx={{ fontWeight: 700 }} align="right">Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {fines.map((fine: any) => (
                          <TableRow key={fine._id} hover>
                            <TableCell>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{fine.description || 'Library Fine'}</Typography>
                            </TableCell>
                            <TableCell>
                              <Chip size="small" label={fine.fineType} sx={{ fontWeight: 600, bgcolor: '#fef3c7', color: '#92400e' }} />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#d97706' }}>
                                ₹{fine.netAmount || fine.amount}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                size="small" 
                                label={fine.status} 
                                color={fine.status === 'PAID' ? 'success' : 'warning'} 
                                sx={{ fontWeight: 700 }} 
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(fine.createdAt || Date.now()).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              {fine.status !== 'PAID' ? (
                                <Button 
                                  size="small" 
                                  variant="contained" 
                                  color="warning" 
                                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                                  onClick={() => alert(`Fine of ₹${fine.netAmount || fine.amount} added to parent checkout cart.`)}
                                >
                                  Pay Due Now
                                </Button>
                              ) : (
                                <Chip size="small" label="Cleared" color="success" variant="outlined" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                )}
              </Box>
            )}

            {/* Tab 2: Borrowing History */}
            {activeTab === 2 && (
              <Box>
                {pastIssues.length === 0 ? (
                  <Box sx={{ p: 6, textAlign: 'center', color: 'text.secondary' }}>
                    <Typography variant="body2">No past return history found for this academic term.</Typography>
                  </Box>
                ) : (
                  <Box sx={{ overflowX: 'auto' }}>
                    <Table>
                      <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Book Title</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Issue Date</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Return Date</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Condition</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {pastIssues.map((issue: any) => (
                          <TableRow key={issue._id} hover>
                            <TableCell>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{issue.bookId?.title || 'Library Book'}</Typography>
                              <Typography variant="caption" color="text.secondary">ISBN: {issue.bookId?.isbn13 || 'N/A'}</Typography>
                            </TableCell>
                            <TableCell>{new Date(issue.issueDate).toLocaleDateString()}</TableCell>
                            <TableCell>{new Date(issue.dueDate).toLocaleDateString()}</TableCell>
                            <TableCell><Chip size="small" label="Returned in Good Condition" color="success" variant="outlined" sx={{ fontWeight: 600 }} /></TableCell>
                            <TableCell><Chip size="small" label="RETURNED" color="success" sx={{ fontWeight: 700 }} /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ParentLibraryView;
