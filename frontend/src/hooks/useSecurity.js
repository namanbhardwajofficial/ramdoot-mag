import { useState, useCallback } from 'react';
import { authApi, usersApi, listOf } from '@/lib/api';
import { toastSuccess, toastError } from '@/lib/confirm';

// Mirror of the backend ChangePasswordDto rules so we can fail fast with a
// friendlier message than the class-validator response.
const STRONG_ENOUGH = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export function validatePasswordChange({ current, next, confirm }) {
  if (!current) return 'Enter your current password';
  if (!next) return 'Enter a new password';
  if (next !== confirm) return 'New passwords do not match';
  if (!STRONG_ENOUGH.test(next))
    return 'Password must be at least 8 characters with an uppercase letter, a lowercase letter and a number';
  if (next === current) return 'New password must be different from the current one';
  return null;
}

// Device rows come back as raw DeviceSession entities; flatten them into what
// the sessions list renders. `deviceType` is a free-text column, so treat
// anything phone-ish as mobile and default to desktop.
function mapSession(s) {
  const type = String(s.deviceType || '').toLowerCase();
  return {
    id: s.id,
    type: /phone|mobile|android|ios|tablet/.test(type) ? 'phone' : 'desktop',
    name: s.deviceName || s.userAgent || 'Unknown device',
    meta: [s.ipAddress, s.lastActiveAt ? new Date(s.lastActiveAt).toLocaleString() : null]
      .filter(Boolean)
      .join(' • '),
    lastActiveAt: s.lastActiveAt,
  };
}

/**
 * Shared logic for the Security settings panels: password change, 2FA setup
 * and the "where you're logged in" device list.
 */
export default function useSecurity() {
  const [savingPassword, setSavingPassword] = useState(false);

  // 2FA enrolment is two calls: generate (returns secret + otpauth URI to show
  // as a QR) then enable (verifies the code from the authenticator app).
  const [twoFactor, setTwoFactor] = useState(null);
  const [twoFactorBusy, setTwoFactorBusy] = useState(false);

  const [devices, setDevices] = useState([]);
  const [devicesLoading, setDevicesLoading] = useState(true);

  const changePassword = useCallback(async ({ current, next, confirm }) => {
    const problem = validatePasswordChange({ current, next, confirm });
    if (problem) {
      toastError(problem);
      return false;
    }
    setSavingPassword(true);
    try {
      await authApi.changePassword({ currentPassword: current, newPassword: next });
      toastSuccess('Password updated');
      return true;
    } catch (err) {
      toastError(err.message || 'Could not update password');
      return false;
    } finally {
      setSavingPassword(false);
    }
  }, []);

  const startTwoFactor = useCallback(async () => {
    setTwoFactorBusy(true);
    try {
      const data = await authApi.generate2fa();
      setTwoFactor(data);
      return data;
    } catch (err) {
      toastError(err.message || 'Could not start 2FA setup');
      return null;
    } finally {
      setTwoFactorBusy(false);
    }
  }, []);

  const confirmTwoFactor = useCallback(async (token) => {
    if (!token) {
      toastError('Enter the code from your authenticator app');
      return false;
    }
    setTwoFactorBusy(true);
    try {
      await authApi.enable2fa(token);
      setTwoFactor(null);
      toastSuccess('Two-factor authentication enabled');
      return true;
    } catch (err) {
      toastError(err.message || 'Could not enable 2FA');
      return false;
    } finally {
      setTwoFactorBusy(false);
    }
  }, []);

  const disableTwoFactor = useCallback(async () => {
    setTwoFactorBusy(true);
    try {
      await authApi.disable2fa();
      setTwoFactor(null);
      toastSuccess('Two-factor authentication disabled');
      return true;
    } catch (err) {
      toastError(err.message || 'Could not disable 2FA');
      return false;
    } finally {
      setTwoFactorBusy(false);
    }
  }, []);

  const cancelTwoFactor = useCallback(() => setTwoFactor(null), []);

  const loadDevices = useCallback(async () => {
    setDevicesLoading(true);
    try {
      setDevices(listOf(await usersApi.devices()).map(mapSession));
    } catch (err) {
      console.warn('devices', err.message);
    } finally {
      setDevicesLoading(false);
    }
  }, []);

  const revokeDevice = useCallback(async (id) => {
    try {
      await usersApi.revokeDevice(id);
      // Drop it locally rather than refetching — the row is already gone.
      setDevices((list) => list.filter((d) => d.id !== id));
      toastSuccess('Signed out of that device');
    } catch (err) {
      toastError(err.message || 'Could not revoke that session');
    }
  }, []);

  return {
    savingPassword,
    changePassword,
    twoFactor,
    twoFactorBusy,
    startTwoFactor,
    confirmTwoFactor,
    disableTwoFactor,
    cancelTwoFactor,
    devices,
    devicesLoading,
    loadDevices,
    revokeDevice,
  };
}
