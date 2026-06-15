import SettingsShell from '@/components/settings/SettingsShell';
import MyDetailsPanel from '@/components/settings/MyDetailsPanel';
import SecurityPanel from '@/components/settings/SecurityPanel';
import { UserIcon, ShieldIcon } from '@/components/ui/icons';

const tabs = [
  { key: 'details', label: 'My details', icon: <UserIcon />, render: () => <MyDetailsPanel /> },
  { key: 'security', label: 'Security', icon: <ShieldIcon />, render: () => <SecurityPanel /> },
];

export default function AdminSettings() {
  return <SettingsShell tabs={tabs} />;
}
