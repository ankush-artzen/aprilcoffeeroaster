export default function ProductPageHeader({
  title,
  price,
  className = "",
  withIds = true,
}: {
  title: string;
  price: string;
  className?: string;
  withIds?: boolean;
}) {
  return (
    <div
      aria-label="product-header"
      className={`w-full select-none uppercase ${className}`}
      {...(withIds ? { id: "product-header" } : {})}
    >
      <h1
        aria-label="product-title"
        {...(withIds ? { id: "product-title" } : {})}
        className="
          type-h1
          text-[24px]
          leading-[24px]

          sm:text-[32px]
          sm:leading-[32px]
        "
      >
        {title}
      </h1>

      <h3
        aria-label="product-price"
        {...(withIds ? { id: "product-price" } : {})}
        className="type-text mt-0 text-[15px]"
      >
        <span>{price}</span>
      </h3>
    </div>
  );
}
