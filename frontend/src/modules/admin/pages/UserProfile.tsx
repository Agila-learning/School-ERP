import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, Avatar, Chip, Alert, CircularProgress } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById, updateUser } from '../../auth/api/users.api';
import type { User } from '../../auth/api/users.api';
import PageHeader from '../../../core/components/PageHeader';

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  const fetchUser = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getUserById(id);
      setUser(data);
      setFormData({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!id) return;
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const updated = await updateUser(id, formData);
      setUser(updated);
      setSuccess('Profile updated successfully.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;
  if (!user) return <Box sx={{ p: 4 }}><Alert severity="error">User not found</Alert></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: 'auto' }}>
      <PageHeader 
        title="User Profile"
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Users', href: '/admin/users' },
          { label: 'Profile' }
        ]}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 3 }}>
        <Box>
          <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
            <Avatar 
              sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: '2rem' }}
            >
              {user.firstName[0]}{user.lastName[0]}
            </Avatar>
            <Typography variant="h6">{user.firstName} {user.lastName}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{user.email}</Typography>
            <Chip 
              label={user.accountStatus.toUpperCase()} 
              color={user.accountStatus === 'active' ? 'success' : 'default'} 
              size="small" 
              sx={{ mb: 2 }}
            />
            <Box>
              {user.roleIds?.map((r: any) => (
                <Chip key={r._id} label={r.name} size="small" variant="outlined" sx={{ m: 0.5 }} />
              ))}
            </Box>
          </Paper>
        </Box>

        <Box>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>Edit Information</Typography>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <TextField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} fullWidth />
              </Box>
              <Box>
                <TextField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} fullWidth />
              </Box>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <TextField label="Email Address" name="email" value={formData.email} onChange={handleChange} fullWidth disabled />
              </Box>
            </Box>

            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button onClick={() => navigate('/admin/users')}>Cancel</Button>
              <Button variant="contained" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default UserProfile;
