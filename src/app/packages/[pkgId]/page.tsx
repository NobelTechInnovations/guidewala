import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import PageBanner from "@/components/booking/PageBanner";
import GuideBookingForm from "@/components/booking/GuideBookingForm";
import { dbConnect } from "@/lib/mongodb";
import { PackageTitleMaster, PackageDescDetails, CityMaster, HotelMaster } from "@/models";

const IMG_BASE = process.env.NEXT_PUBLIC_IMG_BASE || "https://admin.guidewala.co.in/";

type PackageLean = {
  PKG_ID: number;
  TITLE_NAME: string;
  CITY_ID: string;
  PKG_AMOUNT: number;
  PKG_IMAGE: string;
  PKG_DESC: string;
};
type ItineraryLean = { ID: number; ITINERARY: string; PACKAGE_DESC: string; PKG_IMAGE: string };

async function getPackage(pkgId: number) {
  await dbConnect();
  const pkg = (await PackageTitleMaster.findOne({ PKG_ID: pkgId, IS_ACTIVE: "Y" }).lean()) as unknown as PackageLean | null;
  if (!pkg) return null;

  const [city, itinerary, hotels] = await Promise.all([
    CityMaster.findOne({ CITY_ID: pkg.CITY_ID }).lean() as unknown as { CITY_NAME: string } | null,
    PackageDescDetails.find({ PKG_ID: pkgId }).lean() as unknown as ItineraryLean[],
    HotelMaster.find({ CITY_ID: pkg.CITY_ID, IS_ACTIVE: "Y" }).lean() as unknown as { HOTEL_NAME: string }[],
  ]);

  return { pkg, cityName: city?.CITY_NAME || "", itinerary, hotels: hotels.map((h) => h.HOTEL_NAME) };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pkgId: string }>;
}): Promise<Metadata> {
  const { pkgId } = await params;
  const data = await getPackage(Number(pkgId));
  if (!data) return { title: "Package not found | Guidewala" };
  return {
    title: `${data.pkg.TITLE_NAME} | Guidewala`,
    description: `Book a government-approved guide for ${data.pkg.TITLE_NAME} in ${data.cityName}.`,
  };
}

export default async function PackageDetailsPage({
  params,
}: {
  params: Promise<{ pkgId: string }>;
}) {
  const { pkgId } = await params;
  const data = await getPackage(Number(pkgId));
  if (!data) notFound();

  const { pkg, cityName, itinerary, hotels } = data;

  return (
    <main>
      <PageBanner title={pkg.TITLE_NAME} crumb={cityName} />

      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <div>
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                <Image
                  src={`${IMG_BASE}img/pkgTitleImg/${pkg.PKG_IMAGE}`}
                  alt={pkg.TITLE_NAME}
                  fill
                  sizes="(min-width:1024px) 66vw, 100vw"
                  className="object-cover"
                />
              </div>

              <div className="mt-6 flex flex-wrap gap-6 bg-green-50 rounded-xl p-5 border border-green-100">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">City</span>
                  <p className="text-lg font-bold text-slate-900">{cityName}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Amount</span>
                  <p className="text-lg font-bold text-gw-red">₹{pkg.PKG_AMOUNT.toLocaleString("en-IN")}/-</p>
                </div>
              </div>

              {pkg.PKG_DESC && (
                <div className="mt-6">
                  <h3 className="font-bold text-slate-900 mb-2">Package Details</h3>
                  <div
                    className="prose prose-sm max-w-none text-slate-600"
                    dangerouslySetInnerHTML={{ __html: pkg.PKG_DESC }}
                  />
                </div>
              )}
            </div>

            {itinerary.length > 0 && (
              <div>
                <h3 className="font-bold text-slate-900 mb-4 text-lg">Itinerary</h3>
                <div className="space-y-6">
                  {itinerary.map((item) => (
                    <div key={item.ID} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                      {item.PKG_IMAGE && (
                        <div className="relative aspect-video sm:aspect-square rounded-xl overflow-hidden border border-slate-200">
                          <Image
                            src={`${IMG_BASE}img/pkgItinImg/${item.PKG_IMAGE}`}
                            alt={item.ITINERARY}
                            fill
                            sizes="200px"
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="sm:col-span-2">
                        <h4 className="font-bold text-slate-800 mb-1">{item.ITINERARY}</h4>
                        <div
                          className="text-sm text-slate-600"
                          dangerouslySetInnerHTML={{ __html: item.PACKAGE_DESC }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-sm text-slate-600">
              <strong className="text-slate-900">Payment:</strong> Payment is collected in advance via
              Google Pay / UPI — our team will share payment details on WhatsApp after confirming
              your booking.
            </div>
          </div>

          <div>
            <GuideBookingForm pkgId={pkg.PKG_ID} pkgAmount={pkg.PKG_AMOUNT} hotels={hotels} />
          </div>
        </div>
      </div>
    </main>
  );
}
