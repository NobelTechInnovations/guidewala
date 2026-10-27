import { dbConnect } from "@/lib/mongodb";
import { existingMediaPath } from "@/lib/media.server";
import { SHOWN, durationLabel } from "@/lib/packages";
import { PackageTitleMaster, CityMaster } from "@/models";
import ToursCarousel, { TourSlide } from "./ToursCarousel";

type PackageLean = {
  PKG_ID: number;
  TITLE_NAME: string;
  CITY_ID: string;
  PKG_AMOUNT: number;
  PKG_IMAGE: string;
  DURATION_DAYS?: number;
  DURATION_NIGHTS?: number;
};

async function getSlides(): Promise<TourSlide[]> {
  await dbConnect();
  const [packages, cities] = await Promise.all([
    // Only what the admin switched on: active + "Show on Home" (missing counts as shown).
    PackageTitleMaster.find({ IS_ACTIVE: "Y", SHOW_ON_HOME: SHOWN }).sort({ PKG_AMOUNT: -1 }).lean() as unknown as Promise<PackageLean[]>,
    CityMaster.find({}).lean() as unknown as Promise<{ CITY_ID: string; CITY_NAME: string }[]>,
  ]);
  const cityMap = new Map(cities.map((c) => [c.CITY_ID, c.CITY_NAME]));

  return packages.map((p) => ({
    key: `pkg-${p.PKG_ID}`,
    href: `/packages/${p.PKG_ID}`,
    img: existingMediaPath("pkgTitleImg", p.PKG_IMAGE),
    title: p.TITLE_NAME,
    tag: durationLabel(p.DURATION_DAYS, p.DURATION_NIGHTS) || cityMap.get(p.CITY_ID) || "Guided Tour",
    price: p.PKG_AMOUNT,
  }));
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
