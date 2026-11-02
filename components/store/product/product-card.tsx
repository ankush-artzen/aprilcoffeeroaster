import { formatProductPrice } from "lib/format/format-product-price";
import { shopifyImageUrl } from "lib/shopify-image-url";
import type { Product } from "lib/shopify/types";
import Image from "next/image";
import Link from "next/link";

export default function ProductCard({
  product,
  priority,
}: {
  product: Product;
  priority?: boolean;
}) {
  const price = formatProductPrice(product);
  const imageUrl = shopifyImageUrl(product.featuredImage.url, 400);

  return (
    <Link
      href={`/product/${product.handle}`}
      aria-label={`product-card-${product.handle}`}
      prefetch={true}
    >
      <div
        id={`product-card-${product.handle}`}
        className="group relative mb-10 block text-center uppercase max-md:mb-0 max-md:flex max-md:flex-col max-md:content-center md:max-w-[178px] lg:max-w-[178px]"
      >
        <div
          aria-label="product-card"
          className="block no-underline max-md:float-left"
        >
          <Image
            src={imageUrl}
            alt={product.title}
            width={200}
            height={200}
            unoptimized
            priority={priority}
            sizes="178px"
            className="w-full transition-opacity duration-150 ease-in-out max-md:inline-block md:max-w-[178px] md:group-hover:opacity-40 lg:max-w-[178px] lg:group-hover:opacity-40 select-none"
            style={{ aspectRatio: "1 / 1" }}
          />
        </div>

        <div className="absolute left-0 top-2/4 inline-block w-full -translate-y-1/2 text-center text-sm font-bold opacity-0 transition-opacity duration-150 ease-in-out group-hover:opacity-100 max-md:relative max-md:block max-md:translate-y-0 max-md:pl-4 max-md:text-left max-md:text-sm max-md:opacity-100 pointer-events-none">
          <div className="float-none w-full duration-150 ease-in-out group-hover:transition-colors max-md:w-4/5 max-md:text-[0.9em]">
            <h3 className="type-text2 m-0 text-[12px] leading-[16px]">
              {product.title}
            </h3>
          </div>
          <div
            aria-label="price-label"
            className="type-text2 mt-1 duration-150 ease-in-out group-hover:transition-colors max-md:text-[0.9em] text-[13px] lg:text-md"
          >
            {price}
          </div>
        </div>
      </div>
    </Link>
  );
}
