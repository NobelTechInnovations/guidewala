import VendorShell from "@/components/vendor/VendorShell";

export default function VendorAppLayout({ children }: { children: React.ReactNode }) {
  return <VendorShell>{children}</VendorShell>;
}
