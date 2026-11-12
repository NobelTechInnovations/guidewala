import { PageHeader } from "@/components/admin/ui";
import PackageForm from "@/components/admin/PackageForm";

export default function NewGuideServicePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <PageHeader title="New Guide Service" subtitle="A city tour-guide service shown on Book Guide" />
      <PackageForm pkgType="guide" />
    </div>
  );
}
