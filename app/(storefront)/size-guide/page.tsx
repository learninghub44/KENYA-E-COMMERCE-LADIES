import type { Metadata } from "next";
import { StaticPage } from "../../../components/shared/static-page";

export const metadata: Metadata = {
  title: "Size Guide",
  description: "General sizing guidance for shopping on Zuri Market.",
};

const sizes = [
  { label: "XS", bust: "78-81", waist: "60-63", hips: "86-89" },
  { label: "S", bust: "82-85", waist: "64-67", hips: "90-93" },
  { label: "M", bust: "86-91", waist: "68-73", hips: "94-99" },
  { label: "L", bust: "92-97", waist: "74-79", hips: "100-105" },
  { label: "XL", bust: "98-105", waist: "80-87", hips: "106-113" },
];

export default function SizeGuidePage() {
  return (
    <StaticPage
      title="Size Guide"
      subtitle="A general reference in centimetres. Individual sellers may size differently, so check each listing when possible."
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-4 font-semibold">Size</th>
              <th className="py-2 pr-4 font-semibold">Bust (cm)</th>
              <th className="py-2 pr-4 font-semibold">Waist (cm)</th>
              <th className="py-2 pr-4 font-semibold">Hips (cm)</th>
            </tr>
          </thead>
          <tbody>
            {sizes.map((row) => (
              <tr key={row.label} className="border-b text-muted-foreground">
                <td className="py-2 pr-4 font-medium text-foreground">{row.label}</td>
                <td className="py-2 pr-4">{row.bust}</td>
                <td className="py-2 pr-4">{row.waist}</td>
                <td className="py-2 pr-4">{row.hips}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        This chart is a general guide. Fit can vary by brand and seller —
        when a listing includes its own size chart or measurements, use
        those instead.
      </p>
    </StaticPage>
  );
}
