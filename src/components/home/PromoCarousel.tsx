"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import Image from "next/image";
import Link from "next/link";

const SLIDES = [
  { href: "/dekho-rajasthan", img: "/assets/img/dekho-rajasthan.jpg", alt: "Rajasthan", external: false },
  { href: "https://guidewala.co.in/CHARDHAM-PACKAGE.pdf", img: "/assets/img/mytirthindia1.jpg", alt: "Chardham", external: true },
  { href: "https://guidewala.co.in/DODHAM-PACKAGE.pdf", img: "/assets/img/mytirthindia2.jpg", alt: "Dodham", external: true },
];

export default function PromoCarousel() {
  return (
    <section className="py-12 md:py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          spaceBetween={10}
          centeredSlides
          loop
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          pagination={{ clickable: true, dynamicBullets: true }}
          navigation
          breakpoints={{ 640: { spaceBetween: 20 }, 1024: { spaceBetween: 30 } }}
          className="rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden border border-gray-100 h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px] [&_.swiper-pagination-bullet-active]:bg-gw-green [&_.swiper-button-next]:text-white [&_.swiper-button-prev]:text-white"
        >
          {SLIDES.map((slide) => (
            <SwiperSlide key={slide.img} className="h-full">
              {slide.external ? (
                <a href={slide.href} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative group">
                  <Image src={slide.img} alt={slide.alt} fill sizes="100vw" className="object-fill group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                </a>
              ) : (
                <Link href={slide.href} className="block w-full h-full relative group">
                  <Image src={slide.img} alt={slide.alt} fill sizes="100vw" className="object-fill group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                </Link>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
