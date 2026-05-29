import { sampleComparison } from "@/domain/comparisons/sample-data";
import { DashboardView } from "./dashboard-view";

/**
 * Demo dashboard with illustrative sample data. Real comparisons live at
 * /dashboard/[id] and read from the database.
 */
export default function DashboardPage() {
  return <DashboardView initialComparison={sampleComparison} demo />;
}
