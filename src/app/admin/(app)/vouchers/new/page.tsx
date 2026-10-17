import { PageHeader } from "@/components/admin/ui";
import VoucherForm from "@/components/admin/VoucherForm";

export default function NewVoucherPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <PageHeader title="New Voucher" subtitle="Service confirmation for a guest's hotel stay" />
      <VoucherForm />
    </div>
  );
}
