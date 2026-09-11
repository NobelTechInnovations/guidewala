import { PageHeader } from "@/components/admin/ui";
import VendorForm from "@/components/admin/VendorForm";

export default function NewVendorPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <PageHeader title="New Vendor" subtitle="Register a company / promo-code partner" />
      <VendorForm />
    </div>
  );
}
