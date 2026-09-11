import { PageHeader } from "@/components/admin/ui";
import HotelForm from "@/components/admin/HotelForm";

export default function NewHotelPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <PageHeader title="New Hotel" />
      <HotelForm />
    </div>
  );
}
