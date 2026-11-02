import RangeProductCard from "components/store/range/range-product-card";
import type { DatoRangeRecord } from "lib/cms/range";

export default function RangePage({ range }: { range: DatoRangeRecord }) {
  return (
    <main
      role="main"
      id="mainContent"
      className="flex flex-1 grow justify-center bg-white text-black"
    >
      <div className="mx-5 flex w-full max-w-5xl">
        {range.products.length === 0 ? (
          <p className="w-full py-16 text-center text-sm font-bold uppercase">
            No products in this range yet.
          </p>
        ) : (
          <div
            aria-label="range-view"
            className="flex w-full flex-wrap content-start items-start"
          >
            {range.products.map((product) => (
              <RangeProductCard
                key={product.slug}
                product={product}
                rangeSlug={range.slug}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
