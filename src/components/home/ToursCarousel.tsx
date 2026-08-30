"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaShieldAlt, FaArrowRight } from "react-icons/fa";

export type TourSlide = {
  key: string;
  href: string;
  img: string;
  title: string;
  tag: string; // e.g. duration, or city name
  price?: number;
  external?: boolean;
};

export default function ToursCarousel({ slides }: { slides: TourSlide[] }) {
  return (
    <Swiper
      modules={[Autoplay, Pagination, Navigation]}
      spaceBetween={20}
      slidesPerView={1.1}
      autoplay={{ delay: 4000, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      navigation
      breakpoints={{
        640: { slidesPerView: 2, spaceBetween: 20 },
        1024: { slidesPerView: 3, spaceBetween: 24 },
      }}
      className="!pb-12 [&_.swiper-pagination-bullet-active]:bg-gw-brand [&_.swiper-button-next]:text-gw-brand [&_.swiper-button-prev]:text-gw-brand [&_.swiper-button-next]:!w-9 [&_.swiper-button-next]:!h-9 [&_.swiper-button-next]:!bg-white [&_.swiper-button-next]:rounded-full [&_.swiper-button-next]:shadow-md [&_.swiper-button-prev]:!w-9 [&_.swiper-button-prev]:!h-9 [&_.swiper-button-prev]:!bg-white [&_.swiper-button-prev]:rounded-full [&_.swiper-button-prev]:shadow-md [&_.swiper-button-next]:after:!text-xs [&_.swiper-button-prev]:after:!text-xs"
    >
      {slides.map((s) => {
        const Card = (
          <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
            <div className="relative aspect-[4/3] bg-slate-100">
              <Image
                src={s.img}
                alt={s.title}
                fill
                sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 90vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur text-gw-brand text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                <FaShieldAlt /> {s.tag}
              </span>
            </div>
            <div className="p-5 flex flex-col flex-grow">
              <h3 className="font-bold text-slate-900 mb-3 leading-snug flex-grow">{s.title}</h3>
              <div className="flex items-end justify-between pt-3 border-t border-slate-100">
                {s.price ? (
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Starting from
                    </span>
                    <span className="text-gw-brand font-extrabold text-lg">
                      ₹{s.price.toLocaleString("en-IN")}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-slate-400 font-medium">View details</span>
                )}
                <span className="flex items-center gap-1 text-xs font-bold text-gw-red uppercase tracking-wide">
                  View <FaArrowRight className="text-[10px] group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </div>
        );

        return (
          <SwiperSlide key={s.key} className="h-auto pb-1">
            {s.external ? (
              <a href={s.href} target="_blank" rel="noopener noreferrer" className="block h-full">
                {Card}
              </a>
            ) : (
              <Link href={s.href} className="block h-full">
                {Card}
              </Link>
            )}
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}
