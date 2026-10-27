import { useState, useEffect, useCallback } from 'react';
import type { Setting } from '../api/settings.api';
import { getSettingsByGroup, bulkUpdateSettings } from '../api/settings.api';

export const useSettings = (group: string) => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSettingsByGroup(group);
      setSettings(data);
    } catch (error) {
      console.error(`Error fetching ${group} settings:`, error);
      setError(`Failed to load ${group} settings`);
    } finally {
      setLoading(false);
    }
  }, [group]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = async (updates: Partial<Setting>[]) => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const updated = await bulkUpdateSettings(updates.map(u => ({ ...u, group })));
      
      // Merge updated settings into local state
      setSettings(prev => {
        const next = [...prev];
        updated.forEach(u => {
          const idx = next.findIndex(n => n.key === u.key);
          if (idx >= 0) {
            next[idx] = u;
          } else {
            next.push(u);
          }
        });
        return next;
      });

      setSuccess('Settings updated successfully');
      return true;
    } catch (error) {
      console.error(`Error saving ${group} settings:`, error);
      setError('Failed to save settings');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const getSettingValue = (key: string, defaultValue: any = '') => {
    const setting = settings.find(s => s.key === key);
    return setting ? setting.value : defaultValue;
  };

  return {
    settings,
    loading,
    saving,
    error,
    success,
    saveSettings,
    getSettingValue,
    refetch: fetchSettings,
  };
};
