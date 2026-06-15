import SettingsShell from '@/components/settings/SettingsShell';
import MyDetailsPanel from '@/components/settings/MyDetailsPanel';
import SecurityPanel from '@/components/settings/SecurityPanel';
import PayoutPanel from '@/components/settings/PayoutPanel';
import { UserIcon, ShieldIcon, CreditCardIcon } from '@/components/ui/icons';

const tabs = [
  { key: 'details', label: 'My details', icon: <UserIcon />, render: () => <MyDetailsPanel /> },
  { key: 'security', label: 'Security', icon: <ShieldIcon />, render: () => <SecurityPanel /> },
  { key: 'payout', label: 'Payout', icon: <CreditCardIcon />, render: () => <PayoutPanel /> },
];

export default function Settings() {
  return <SettingsShell tabs={tabs} />;
}
