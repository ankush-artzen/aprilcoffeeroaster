"use client";

import {
  TriFergSvg,
  triFergLogoFromMarkId,
} from "components/store/logo/landing-logos";
import StoreCart from "components/store/store-cart";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function shouldShowStoreCart(pathname: string) {
  return (
    pathname.startsWith("/product/") ||
    pathname.startsWith("/range/") ||
    pathname.startsWith("/collections/") ||
    pathname === "/cart"
  );
}

const TRI_FERG_MARK_CLASS = "inline-block translate-x-2 w-[80px] max-md:w-12";


const TRI_FERG_MARKS = [
  { id: "grey" },
  { id: "blue" },
  { id: "red" },
] as const;

function shuffleMarks<T>(items: readonly T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
}

export default function Logo({
  onMenuOpenChange,
  showCart: showCartProp,
  productGalleryOpen = false,
  onProductGalleryClose,
}: {
  onMenuOpenChange?: (open: boolean) => void;
  /** When omitted, cart shows on /product/*, /collections/*, and /cart */
  showCart?: boolean;
  productGalleryOpen?: boolean;
  onProductGalleryClose?: () => void;
}) {
  const pathname = usePathname();
  const showCart = showCartProp ?? shouldShowStoreCart(pathname);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    const next = !menuOpen;
    setMenuOpen(next);
    onMenuOpenChange?.(next);
  };
  const [marks, setMarks] = useState(() => [...TRI_FERG_MARKS]);

        useEffect(() => {
          const interval = setInterval(() => {
            setMarks(shuffleMarks(TRI_FERG_MARKS));
          }, 750);

          return () => clearInterval(interval);
        }, []);

  return (
    <header
      role="banner"
      id="header"
      aria-label="header"
      className="mx-auto flex max-w-(--breakpoint-xl) py-0.5 text-center ease-out duration-300 max-md:sticky max-md:top-0 max-md:z-50 max-md:w-full max-md:py-1.5  md:w-[90%] max-md:pb-2 md:pb-4 lg:w-[70%]"
    >
      <div className="w-4/12 max-md:invisible max-md:hidden" />

      <div className="w-4/12 max-md:w-1/2 max-md:text-left">
        <Link
          href="/"
          id="header-fergs"
          aria-label="header-fergs"
          className="mx-auto flex cursor-pointer gap-1 max-md:ml-4"
        >
          {marks.map((mark) => (
            <div
              key={mark.id}
              aria-label="tri-ferg"
              className={TRI_FERG_MARK_CLASS}
            >
              <TriFergSvg logo={triFergLogoFromMarkId(mark.id)} />
            </div>
          ))}
        </Link>
      </div>

      <div className="w-4/12 max-md:w-1/2">
        {/* <div className="float-right flex translate-y-1/2 items-start gap-1"> */}
        <div className="float-right flex translate-y-1/2">
          {showCart ? <StoreCart /> : null}
          {/* <button
            type="button"
            className="ml-auto pl-2.5 md:invisible md:hidden lg:invisible lg:hidden"
            aria-label="mobile-menu-btn"
            id="mobile-menu-btn"
            data-menu-open={menuOpen ? "true" : "false"}
            onClick={toggleMenu}
          >
            <div
              className="group right-0 mr-5 flex h-5 flex-col"
              aria-label="hamburger-button"
            >
              <div
                className={`my-[2.5px] w-[22px] bg-black pb-0.5 transition ease-in-out duration-200 transform ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`}
              />
              <div
                className={`my-[2.5px] w-[22px] bg-black pb-0.5 transition ease-in-out duration-200 transform ${menuOpen ? "opacity-0" : ""}`}
              />
              <div
                className={`my-[2.5px] w-[22px] bg-black pb-0.5 transition ease-in-out duration-200 transform ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`}
              />
            </div>
          </button> */}
          {/* {productGalleryOpen ? (
            <button
              type="button"
              className="ml-auto pr-5 text-[2rem] font-light leading-none md:invisible md:hidden"
              aria-label="close-product-gallery"
              onClick={onProductGalleryClose}
            >
              ×
            </button>
          )  */}
      {productGalleryOpen ? (
  <button
    type="button"
    className="ml-auto pl-2.5 md:invisible md:hidden"
    aria-label="close-product-gallery"
    onClick={onProductGalleryClose}
  >
    <div
      className="group right-0 mr-5 flex h-5 flex-col"
      aria-label="close-button"
    >
      <div
        className="my-[2.5px] w-[22px] bg-black pb-0.5 transition ease-in-out duration-200 transform translate-y-[5.5px] rotate-45"
      />

      <div
        className="my-[2.5px] w-[22px] bg-black pb-0.5 opacity-0 transition ease-in-out duration-200"
      />

      <div
        className="my-[2.5px] w-[22px] bg-black pb-0.5 transition ease-in-out duration-200 transform -translate-y-[8.5px] -rotate-45"
      />
    </div>
  </button>
) : (
     
            <button
              type="button"
              className="ml-auto pl-2.5 md:invisible md:hidden"
              aria-label="mobile-menu-btn"
              id="mobile-menu-btn"
              data-menu-open={menuOpen ? "true" : "false"}
              onClick={toggleMenu}
            >
              <div
                className="group right-0 mr-5 flex h-5 flex-col"
                aria-label="hamburger-button"
              >
                <div
                  className={`my-[2.5px] w-[22px] bg-black pb-0.5 transition ease-in-out duration-200 transform ${
                    menuOpen
                      ? "translate-y-[5.5px] rotate-45 group-hover:opacity-100"
                      : "group-hover:opacity-100"
                  }`}
                />

                <div
                  className={`my-[2.5px] w-[22px] bg-black pb-0.5 transition ease-in-out duration-200 transform ${
                    menuOpen ? "opacity-0" : "group-hover:opacity-100"
                  }`}
                />

                <div
                  className={`my-[2.5px] w-[22px] bg-black pb-0.5 transition ease-in-out duration-200 transform ${
                    menuOpen
                      ? "-translate-y-[8.5px] -rotate-45 group-hover:opacity-100"
                      : "group-hover:opacity-100"
                  }`}
                />
              </div>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
