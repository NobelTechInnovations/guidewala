"use client";

import { useEffect, useState, use } from "react";
import { PageHeader, Loading } from "@/components/admin/ui";
import HotelForm from "@/components/admin/HotelForm";

export default function EditHotelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [initial, setInitial] = useState<{ hotelName: string; cityId: string; isActive: string } | null>(null);

  useEffect(() => {
    fetch(`/api/admin/hotels/${id}`)
      .then((r) => r.json())
      .then((d) =>
        setInitial({ hotelName: d.hotel.HOTEL_NAME, cityId: d.hotel.CITY_ID, isActive: d.hotel.IS_ACTIVE })
      );
  }, [id]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <PageHeader title="Edit Hotel" />
      {initial ? <HotelForm hotelId={id} initial={initial} /> : <Loading />}
    </div>
  );
}
