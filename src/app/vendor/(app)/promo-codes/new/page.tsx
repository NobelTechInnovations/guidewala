import { PageHeader } from "@/components/admin/ui";
import VendorPromoCodeForm from "@/components/vendor/VendorPromoCodeForm";

export default function NewVendorPromoCodePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <PageHeader title="New Promo Code" />
      <VendorPromoCodeForm />
    </div>
  );
}
