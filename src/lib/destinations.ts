import { dbConnect } from "@/lib/mongodb";
import { CityMaster, PackageTitleMaster } from "@/models";
import { existingMediaPath } from "@/lib/media.server";
import type { PackageDoc } from "@/lib/packages";

/** Bundled city photos; any other city falls back to one of its package covers. */
const CITY_PHOTOS: Record<string, string> = {
  delhi: "/assets/img/delhi.jpg",
  agra: "/assets/img/agra.jpg",
  jaipur: "/assets/img/jaipur.jpg",
  udaipur: "/assets/img/udaipur.jpg",
  jodhpur: "/assets/img/jodhpur.jpg",
  jaisalmer: "/assets/img/jaisalmer.jpg",
  bikaner: "/assets/img/bikaner.jpg",
};

export type PackageCard = PackageDoc & { CITY_NAME: string; imageSrc: string | null };
export type Destination = { cityId: string; name: string; img: string | null; count: number };

/** Active packages (newest first) with their city name and a usable cover path. */
export async function getActivePackages(): Promise<PackageCard[]> {
  await dbConnect();
  const [packages, cities] = await Promise.all([
    PackageTitleMaster.find({ IS_ACTIVE: "Y" }).sort({ CREATED_ON: -1 }).lean() as unknown as Promise<PackageDoc[]>,
    CityMaster.find({}).select("CITY_ID CITY_NAME -_id").lean() as unknown as Promise<{ CITY_ID: string; CITY_NAME: string }[]>,
  ]);
  const cityName = new Map(cities.map((c) => [c.CITY_ID, c.CITY_NAME]));
  return packages.map((p) => ({
    ...p,
    CITY_NAME: cityName.get(p.CITY_ID || "") || "",
    imageSrc: existingMediaPath("pkgTitleImg", p.PKG_IMAGE),
  }));
}

/** Only cities that currently have at least one active package. */
export function destinationsFrom(packages: PackageCard[]): Destination[] {
  const byCity = new Map<string, Destination>();
  for (const p of packages) {
    if (!p.CITY_ID || !p.CITY_NAME) continue;
    const d = byCity.get(p.CITY_ID);
    if (d) {
      d.count++;
      d.img ??= p.imageSrc;
    } else {
      byCity.set(p.CITY_ID, {
        cityId: p.CITY_ID,
        name: p.CITY_NAME,
        img: CITY_PHOTOS[p.CITY_NAME.trim().toLowerCase()] ?? p.imageSrc,
        count: 1,
      });
    }
  }
  return [...byCity.values()];
}
