import { dbConnect } from "@/lib/mongodb";
import { PackageTitleMaster, CityMaster } from "@/models";
import ToursCarousel, { TourSlide } from "./ToursCarousel";

const IMG_BASE = process.env.NEXT_PUBLIC_IMG_BASE || "https://admin.guidewala.co.in/";

type PackageLean = {
  PKG_ID: number;
  TITLE_NAME: string;
  CITY_ID: string;
  PKG_AMOUNT: number;
  PKG_IMAGE: string;
};

async function getSlides(): Promise<TourSlide[]> {
  await dbConnect();
  const [packages, cities] = await Promise.all([
    PackageTitleMaster.find({ IS_ACTIVE: "Y" }).sort({ PKG_AMOUNT: -1 }).lean() as unknown as Promise<PackageLean[]>,
    CityMaster.find({}).lean() as unknown as Promise<{ CITY_ID: string; CITY_NAME: string }[]>,
  ]);
  const cityMap = new Map(cities.map((c) => [c.CITY_ID, c.CITY_NAME]));

  const dynamicSlides: TourSlide[] = packages
    .filter((p) => p.PKG_ID !== 19) // Dekho Rajasthan gets its own hand-curated slide below
    .map((p) => ({
      key: `pkg-${p.PKG_ID}`,
      href: `/packages/${p.PKG_ID}`,
      img: `${IMG_BASE}img/pkgTitleImg/${p.PKG_IMAGE}`,
      title: p.TITLE_NAME,
      tag: cityMap.get(p.CITY_ID) || "Guided Tour",
      price: p.PKG_AMOUNT,
    }));

  // Hand-curated slides with real, rich content — placed first.
  const curatedSlides: TourSlide[] = [
    {
      key: "dekho-rajasthan",
      href: "/tour-packages/dekho-rajasthan",
      img: "/assets/img/raj/dr.jpg",
      title: "Dekho Rajasthan — 8 Days / 7 Nights",
      tag: "8D / 7N",
      price: 45000,
    },
    {
      key: "chardham",
      href: "https://guidewala.co.in/CHARDHAM-PACKAGE.pdf",
      img: "/assets/img/mytirthindia1.jpg",
      title: "Chardham Package — The Sacred Himalayan Circuit",
      tag: "Pilgrimage",
      external: true,
    },
    {
      key: "dodham",
      href: "https://guidewala.co.in/DODHAM-PACKAGE.pdf",
      img: "/assets/img/mytirthindia2.jpg",
      title: "Do Dham Package — Kedarnath & Badrinath Yatra",
      tag: "Pilgrimage",
      external: true,
    },
  ];

  return [...curatedSlides, ...dynamicSlides];
}

export default async function FeaturedTours() {
  const slides = await getSlides();
  if (slides.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-end justify-between mb-8 md:mb-10">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
              Featured Tours
            </h2>
            <div className="w-16 h-1 bg-gw-green mt-3 rounded-full" />
          </div>
        </div>

        <ToursCarousel slides={slides} />
      </div>
    </section>
  );
}
