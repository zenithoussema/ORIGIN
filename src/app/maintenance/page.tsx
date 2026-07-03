import { getMaintenancePageHtml } from '@/lib/flags';

export default function MaintenancePage() {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: getMaintenancePageHtml() }}
    />
  );
}
