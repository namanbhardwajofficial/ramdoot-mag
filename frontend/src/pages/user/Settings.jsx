import SettingsLayout from "@/components/user/settings/SettingsLayout";
import MyDetailsPanel from "@/components/user/settings/MyDetailsPanel";
import SecurityPanel from "@/components/user/settings/SecurityPanel";
import BillingsPanel from "@/components/user/settings/BillingsPanel";
import { UserIcon, ShieldIcon, CreditCardIcon } from "@/components/ui/icons";

/**
 * User account settings — My details, Security and Billings tabs.
 * See design/user - settings*.png.
 */
const tabs = [
  { key: "details", label: "My details", icon: <UserIcon />, render: () => <MyDetailsPanel /> },
  { key: "security", label: "Security", icon: <ShieldIcon />, render: () => <SecurityPanel /> },
  { key: "billings", label: "Billings", icon: <CreditCardIcon />, render: () => <BillingsPanel /> },
];

export default function Settings() {
  return <SettingsLayout tabs={tabs} />;
}
