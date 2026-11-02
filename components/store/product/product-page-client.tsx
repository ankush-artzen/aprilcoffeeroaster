"use client";

import CategoryNav from "components/store/collections/category-nav";
import Logo from "components/store/logo/logo";
import ProductMetafieldModal from "components/store/product/product-metafield-modal";
import ProductPageDetailsPanel from "components/store/product/product-page-details-panel";
import ProductPageGallery from "components/store/product/product-page-gallery";
import ProductPageHeader from "components/store/product/product-page-header";
import type { ProductPageClientProps } from "components/store/product/product-page-types";
import { useEffect, useState } from "react";
import Footer from "../layout/footer";

export type {
  ProductPageClientProps,
  ProductPageImage,
  ProductPageRelated,
  ProductPageVariant,
} from "components/store/product/product-page-types";

export default function ProductPageClient({
  product,
  title,
  descriptionLines,
  technicalDetails,
  sizeChart,
  recommendations,
  supplierInformation,
  images,
  variants,
}: ProductPageClientProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [openMetafieldModal, setOpenMetafieldModal] = useState<
    "technical-details" | "size-chart" | null
  >(null);

  const [selectedVariantId, setSelectedVariantId] = useState(
    variants[0]?.id ?? "",
  );
  const [quantity, setQuantity] = useState(1);
  const [galleryMode, setGalleryMode] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  useEffect(() => {
    // Reset quantity when switching variants to avoid accidental oversells.
    setQuantity(1);
  }, [selectedVariantId]);

  const toggleAccordion = (id: string) => {
    setOpenAccordion((prev) => (prev === id ? null : id));
  };

  const selectedVariant =
    variants.find((variant) => variant.id === selectedVariantId) ?? variants[0];
  const hasAnyVariantAvailable = product.variants.some(
    (variant) => variant.availableForSale,
  );

  return (
    <>
      <Logo
        onMenuOpenChange={setMenuOpen}
        productGalleryOpen={galleryMode}
        onProductGalleryClose={() => setGalleryMode(false)}
      />
      <div className="mx-auto mt-3 mb-0 h-screen w-full max-w-[1400px] overflow-y-auto bg-white sm:mt-0 sm:mb-5 max-md:h-auto max-md:overflow-visible">
        <CategoryNav menuOpen={menuOpen} />

        <main
          role="main"
          id="mainContent"
          className="
  h-[calc(100vh-130px)]
  min-h-0
  overflow-y-scroll
  mt-0
  // w-9/12
  w-[73%]
  sm:w-[7%]
  pr-[20px]

  ease-out
  duration-300

  sm:mt-8
  sm:w-[75.2%]

  max-md:h-auto
  max-md:overflow-y-visible
  max-md:float-none
  max-md:mt-0
  max-md:w-full
  max-md:pr-0
  max-md:-translate-x-0
"
        >
          <div
            aria-label="product-view"
            id="product-view"
            className="
    relative
    flex
    justify-between
    gap-[2%]

    max-md:flex-col
  "
          >
            {/* Mobile: title + price above images; desktop unchanged */}
            {!galleryMode ? (
              <div className="hidden w-full min-w-0 max-md:block max-md:px-5">
                <ProductPageHeader
                  title={title}
                  price={selectedVariant?.price ?? ""}
                  withIds={false}
                />
              </div>
            ) : null}

            <ProductPageGallery
              title={title}
              images={images}
              galleryMode={galleryMode}
              selectedImage={selectedImage}
              onSelectedImageChange={setSelectedImage}
              onGalleryModeChange={setGalleryMode}
            />

            {!galleryMode ? (
              <ProductPageDetailsPanel
                product={product}
                title={title}
                descriptionLines={descriptionLines}
                technicalDetails={technicalDetails}
                sizeChart={sizeChart}
                recommendations={recommendations}
                supplierInformation={supplierInformation}
                variants={variants}
                selectedVariantId={selectedVariantId}
                selectedVariant={selectedVariant}
                quantity={quantity}
                hasAnyVariantAvailable={hasAnyVariantAvailable}
                openAccordion={openAccordion}
                onToggleAccordion={toggleAccordion}
                onSelectedVariantIdChange={setSelectedVariantId}
                onQuantityChange={setQuantity}
                onOpenMetafieldModal={setOpenMetafieldModal}
              />
            ) : null}
          </div>
          <div className={galleryMode ? "max-md:hidden" : undefined} />
        </main>
      </div>
      <Footer />

      <ProductMetafieldModal
        isOpen={openMetafieldModal === "technical-details"}
        onClose={() => setOpenMetafieldModal(null)}
        productTitle={title}
        technicalDetails={technicalDetails}
      />
      <ProductMetafieldModal
        isOpen={openMetafieldModal === "size-chart"}
        onClose={() => setOpenMetafieldModal(null)}
        productTitle={title}
        sizeChart={sizeChart}
      />
    </>
  );
}
