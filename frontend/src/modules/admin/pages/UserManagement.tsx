import React, { useState, useEffect } from 'react';
import { 
  Box, Paper, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  CircularProgress, Tabs, Tab, TablePagination, Menu, InputAdornment, Alert
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { 
  getUsers, getRoles, updateUserStatus, updateUserRoles, 
  getInvitations, inviteUser, resendInvitation, revokeInvitation
} from '../../auth/api/users.api';
import type { User, Invitation } from '../../auth/api/users.api';
import PageHeader from '../../../core/components/PageHeader';

const UserManagement: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [notification, setNotification] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  
  // Dialog State
  const [openInviteDialog, setOpenInviteDialog] = useState(false);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [inviteFormData, setInviteFormData] = useState({ email: '', roleId: '' });
  const [roleFormData, setRoleFormData] = useState({ roleIds: [] as string[] });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Menu State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuUser, setMenuUser] = useState<User | null>(null);
  const [menuInvite, setMenuInvite] = useState<Invitation | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tabIndex === 0) {
        const data = await getUsers({ search, page: page + 1, limit: rowsPerPage });
        setUsers(data.users);
        setTotalCount(data.pagination.total);
      } else {
        const data = await getInvitations({ search, page: page + 1, limit: rowsPerPage });
        setInvitations(data.invitations);
        setTotalCount(data.pagination.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await getRoles();
      setRoles(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, page, rowsPerPage, tabIndex]);

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, record: any, type: 'user' | 'invite') => {
    setAnchorEl(event.currentTarget);
    if (type === 'user') setMenuUser(record);
    if (type === 'invite') setMenuInvite(record);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuUser(null);
    setMenuInvite(null);
  };

  const handleDirectStatusChange = async (userId: string, status: string, name: string) => {
    setActionLoadingId(userId);
    try {
      await updateUserStatus(userId, status);
      setNotification(`User account for "${name}" has been ${status === 'active' ? 'ACTIVATED' : 'DEACTIVATED'} successfully.`);
      setTimeout(() => setNotification(null), 4000);
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update user status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!menuUser) return;
    try {
      await updateUserStatus(menuUser._id, status);
      setNotification(`User account status updated to ${status.toUpperCase()}`);
      setTimeout(() => setNotification(null), 4000);
      fetchData();
    } catch (err) {
      console.error(err);
    }
    handleMenuClose();
  };

  const handleInviteSubmit = async () => {
    try {
      await inviteUser(inviteFormData.email, inviteFormData.roleId);
      setOpenInviteDialog(false);
      setInviteFormData({ email: '', roleId: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResendInvite = async () => {
    if (!menuInvite) return;
    try {
      await resendInvitation(menuInvite._id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
    handleMenuClose();
  };

  const handleRevokeInvite = async () => {
    if (!menuInvite) return;
    try {
      await revokeInvitation(menuInvite._id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
    handleMenuClose();
  };

  const openChangeRole = () => {
    if (menuUser) {
      setSelectedUser(menuUser);
      setRoleFormData({ roleIds: menuUser.roleIds.map((r: any) => r._id) });
      setOpenRoleDialog(true);
    }
    handleMenuClose();
  };

  const handleChangeRoleSubmit = async () => {
    if (!selectedUser) return;
    try {
      await updateUserRoles(selectedUser._id, roleFormData.roleIds);
      setOpenRoleDialog(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const renderStatus = (status: string) => {
    const colorMap: any = {
      active: 'success',
      suspended: 'error',
      inactive: 'default',
      archived: 'default',
      invited: 'info',
      pending: 'warning',
      PENDING: 'warning',
      ACCEPTED: 'success',
      REVOKED: 'error',
      EXPIRED: 'default'
    };
    return <Chip label={status.toUpperCase()} color={colorMap[status] || 'default'} size="small" />;
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <PageHeader 
        title="User & Account Management"
        breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Users' }]}
        primaryAction={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenInviteDialog(true)}>
            Invite User
          </Button>
        }
      />

      {notification && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setNotification(null)}>
          {notification}
        </Alert>
      )}

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs value={tabIndex} onChange={(_, v) => { setTabIndex(v); setPage(0); }} sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Active Users & Staff" />
          <Tab label="Invitations" />
        </Tabs>

        <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search email or name..."
            size="small"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> } }}
            sx={{ width: { xs: '100%', sm: 260 } }}
          />

          {tabIndex === 0 && (
            <>
              <TextField
                select
                label="Account Status"
                size="small"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{ width: 170 }}
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                <MenuItem value="active">Active Only</MenuItem>
                <MenuItem value="inactive">Inactive Only</MenuItem>
                <MenuItem value="suspended">Suspended Only</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </TextField>

              <TextField
                select
                label="Filter Role"
                size="small"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                sx={{ width: 170 }}
              >
                <MenuItem value="ALL">All Roles</MenuItem>
                {roles.map(r => (
                  <MenuItem key={r._id} value={r.name}>{r.name}</MenuItem>
                ))}
              </TextField>
            </>
          )}
        </Box>

        <TableContainer sx={{ minHeight: 400 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
              <CircularProgress />
            </Box>
          ) : tabIndex === 0 ? (
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Roles</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Account Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Admin Access Controls</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users
                  .filter((u) => {
                    const matchesStatus = statusFilter === 'ALL' || (u.accountStatus || '').toLowerCase() === statusFilter.toLowerCase();
                    const matchesRole = roleFilter === 'ALL' || u.roleIds?.some((r: any) => r._id === roleFilter || r.name?.toLowerCase() === roleFilter.toLowerCase());
                    return matchesStatus && matchesRole;
                  })
                  .map((user) => {
                    const isActive = (user.accountStatus || '').toLowerCase() === 'active';
                    const isBusy = actionLoadingId === user._id;

                    return (
                      <TableRow key={user._id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{user.firstName} {user.lastName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.roleIds?.map((r: any) => (
                            <Chip key={r._id} label={r.name} size="small" sx={{ mr: 0.5, my: 0.2 }} />
                          ))}
                        </TableCell>
                        <TableCell>{renderStatus(user.accountStatus)}</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                            {isActive ? (
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                disabled={isBusy}
                                onClick={() => handleDirectStatusChange(user._id, 'inactive', `${user.firstName} ${user.lastName}`)}
                                sx={{ textTransform: 'none', fontWeight: 600, py: 0.3, px: 1.5, fontSize: '0.75rem', borderRadius: 1.5 }}
                              >
                                {isBusy ? 'Updating...' : 'Deactivate'}
                              </Button>
                            ) : (
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                disabled={isBusy}
                                onClick={() => handleDirectStatusChange(user._id, 'active', `${user.firstName} ${user.lastName}`)}
                                sx={{ textTransform: 'none', fontWeight: 600, py: 0.3, px: 1.5, fontSize: '0.75rem', borderRadius: 1.5, boxShadow: 'none' }}
                              >
                                {isBusy ? 'Updating...' : 'Activate'}
                              </Button>
                            )}

                            <IconButton onClick={(e) => handleMenuOpen(e, user, 'user')} size="small">
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Expires</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invitations.map((inv) => (
                  <TableRow key={inv._id}>
                    <TableCell>{inv.email}</TableCell>
                    <TableCell><Chip label={inv.roleId?.name} size="small" /></TableCell>
                    <TableCell>{renderStatus(inv.status)}</TableCell>
                    <TableCell>{new Date(inv.expiresAt).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={(e) => handleMenuOpen(e, inv, 'invite')}><MoreVertIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </Paper>

      {/* User Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl) && Boolean(menuUser)} onClose={handleMenuClose}>
        <MenuItem onClick={openChangeRole}>Change Role</MenuItem>
        {menuUser?.accountStatus !== 'active' && <MenuItem onClick={() => handleStatusChange('active')}>Activate</MenuItem>}
        {menuUser?.accountStatus === 'active' && <MenuItem onClick={() => handleStatusChange('suspended')}>Suspend</MenuItem>}
        {menuUser?.accountStatus !== 'inactive' && <MenuItem onClick={() => handleStatusChange('inactive')}>Deactivate</MenuItem>}
      </Menu>

      {/* Invite Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl) && Boolean(menuInvite)} onClose={handleMenuClose}>
        <MenuItem onClick={handleResendInvite} disabled={menuInvite?.status === 'ACCEPTED'}>Resend Invitation</MenuItem>
        <MenuItem onClick={handleRevokeInvite} disabled={menuInvite?.status === 'ACCEPTED'} sx={{ color: 'error.main' }}>Revoke Invitation</MenuItem>
      </Menu>

      {/* Invite Dialog */}
      <Dialog open={openInviteDialog} onClose={() => setOpenInviteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Invite New User</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Email Address"
              type="email"
              value={inviteFormData.email}
              onChange={(e) => setInviteFormData({ ...inviteFormData, email: e.target.value })}
              fullWidth required
            />
            <TextField
              select
              label="Assign Role"
              value={inviteFormData.roleId}
              onChange={(e) => setInviteFormData({ ...inviteFormData, roleId: e.target.value })}
              fullWidth required
            >
              {roles.map(r => (
                <MenuItem key={r._id} value={r._id}>{r.name}</MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInviteDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleInviteSubmit} disabled={!inviteFormData.email || !inviteFormData.roleId}>
            Send Invitation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={openRoleDialog} onClose={() => setOpenRoleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Roles</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              select
              label="Select Roles"
              slotProps={{ select: { multiple: true } }}
              value={roleFormData.roleIds}
              onChange={(e) => setRoleFormData({ roleIds: e.target.value as unknown as string[] })}
              fullWidth
            >
              {roles.map(r => (
                <MenuItem key={r._id} value={r._id}>{r.name}</MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRoleDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleChangeRoleSubmit} disabled={roleFormData.roleIds.length === 0}>
            Save Roles
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default UserManagement;
