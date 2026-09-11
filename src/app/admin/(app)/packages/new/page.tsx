import { PageHeader } from "@/components/admin/ui";
import PackageForm from "@/components/admin/PackageForm";

export default function NewPackagePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <PageHeader title="New Package" />
      <PackageForm />
    </div>
  );
}
