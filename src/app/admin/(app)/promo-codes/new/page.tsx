import { PageHeader } from "@/components/admin/ui";
import PromoCodeForm from "@/components/admin/PromoCodeForm";

export default function NewPromoCodePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <PageHeader title="New Promo Code" />
      <PromoCodeForm />
    </div>
  );
}
