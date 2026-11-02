"use client";

import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import clsx from "clsx";

const filterBtnClass =
  "flex items-center justify-center whitespace-nowrap border-2 border-black px-4 text-center cursor-pointer text-[10px] leading-[15px] font-bold uppercase max-md:my-1 max-md:h-8 max-md:py-1 max-md:text-[13px] max-md:leading-[18px]";

type CollectionFilterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  showSoldOut: boolean;
  onShowSoldOutChange: (show: boolean) => void;
  query: string;
  onQueryChange: (query: string) => void;
  onClear: () => void;
};

export default function CollectionFilterModal({
  isOpen,
  onClose,
  showSoldOut,
  onShowSoldOutChange,
  query,
  onQueryChange,
  onClear,
}: CollectionFilterModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50">
      <DialogBackdrop
        transition
        className="absolute inset-0 overflow-auto bg-white/75 opacity-100 transition duration-200 ease-out data-closed:opacity-0"
      />

      <div className="absolute inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 max-md:p-0">
          <DialogPanel
            transition
            aria-label="popover-modal"
            className="relative flex w-3/5 max-w-[400px] flex-col border-2 border-black bg-white px-[30px] py-[15px] text-[13px] leading-[18px] transition duration-200 ease-out data-closed:scale-95 data-closed:opacity-0 max-md:max-h-full max-md:w-full max-md:max-w-[500px] max-md:overflow-y-scroll max-md:px-2.5"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="close-modal-button"
              className={clsx(
                filterBtnClass,
                "btn-brand absolute right-0 top-0 h-5 w-[50px]! border-r-0 border-t-0 max-md:my-0! max-md:px-2"
              )}
            >
              Close
            </button>

            <div className="max-md:p-2">
              <div className="my-4">
                <h3 className="select-none text-[13px] leading-[18px] font-bold uppercase">
                  Sold Out
                </h3>

                <div className="mt-2">
                  <div className="inline-flex overflow-hidden border-2 border-black">
                    <button
                      type="button"
                      aria-label="show-button"
                      disabled={showSoldOut}
                      onClick={() => onShowSoldOutChange(true)}
                      className={clsx(
                        "px-6 py-1 text-[10px] leading-[15px] font-bold uppercase transition disabled:cursor-not-allowed max-md:text-[13px] max-md:leading-[18px]",
                        showSoldOut
                          ? "cursor-pointer bg-black text-white"
                          : "cursor-pointer bg-white text-black"
                      )}
                    >
                      Show
                    </button>

                    <button
                      type="button"
                      aria-label="hide-button"
                      disabled={!showSoldOut}
                      onClick={() => onShowSoldOutChange(false)}
                      className={clsx(
                        "border-l border-black px-6 py-1 text-[10px] leading-[15px] font-bold uppercase transition disabled:cursor-not-allowed max-md:text-[13px] max-md:leading-[18px]",
                        !showSoldOut
                          ? "cursor-pointer bg-black text-white"
                          : "cursor-pointer bg-white text-black"
                      )}
                    >
                      Hide
                    </button>
                  </div>
                </div>
              </div>

              <div className="my-4">
                <h3 className="select-none text-[13px] leading-[18px] font-bold uppercase">
                  Search
                </h3>

                <div className="mt-2">
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => onQueryChange(event.target.value)}
                    placeholder="Search products"
                    aria-label="search-products"
                    autoComplete="off"
                    className="w-full border-2 border-black bg-white px-3 py-2 text-[13px] leading-[18px] text-black outline-none placeholder:text-standard-grey placeholder:normal-case"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  aria-label="clear-btn"
                  onClick={onClear}
                  className={clsx(
                    filterBtnClass,
                    "btn-brand bg-black py-1"
                  )}
                >
                  Clear
                </button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
