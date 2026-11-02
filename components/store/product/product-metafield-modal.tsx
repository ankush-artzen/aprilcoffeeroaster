"use client";

import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import clsx from "clsx";
import type {
  ParsedSizeChart,
  ParsedTechnicalDetails,
  SizeChartData,
} from "lib/store/parse-product-metafields";

const modalTextClass = "text-[13px] leading-[18px]";

const closeBtnClass =
  "btn-brand flex items-center justify-center whitespace-nowrap border-[2pt] px-4 text-center text-sm font-bold uppercase max-md:h-8 max-md:py-1 max-md:text-base absolute right-0 top-0 h-5 w-[50px]! cursor-pointer border-r-0 border-t-0 max-md:my-0 max-md:px-2";

const technicalDetailsPanelClass =
  `relative left-1/2 top-1/2 flex w-3/5 max-w-[400px] -translate-x-1/2 -translate-y-1/2 flex-col border-2 border-black bg-white px-[30px] py-8 ${modalTextClass} font-normal opacity-100 max-md:max-h-full max-md:w-full max-md:max-w-[500px] max-md:overflow-y-scroll max-md:px-2.5`;

const technicalDetailsContentClass =
  `select-none ${modalTextClass} font-normal uppercase [&>ul]:my-4 [&>ul]:block [&>ul]:list-disc [&>ul]:pl-4 [&_li]:font-normal [&_li]:leading-[18px] [&_p]:font-normal`;

const modalTitleClass =
  `mb-4 mt-0 block select-none ${modalTextClass} font-bold uppercase`;

const sizeChartTitleClass =
  "my-4 block text-[13px] leading-[18px] select-none text-base font-bold uppercase";

const sizeChartPanelClass =
  `relative left-1/2 top-1/2 flex w-3/5 max-w-[400px] -translate-x-1/2 -translate-y-1/2 flex-col border-2 border-black bg-white px-[30px] py-[15px] ${modalTextClass} font-normal opacity-100 max-md:max-h-full max-md:w-full max-md:max-w-[500px] max-md:overflow-y-scroll max-md:px-2.5`;

type ProductMetafieldModalProps = {
  isOpen: boolean;
  onClose: () => void;
  productTitle?: string;
  title?: string;
  technicalDetails?: ParsedTechnicalDetails | null;
  sizeChart?: ParsedSizeChart | null;
};

function SizeChartTable({ data }: { data: SizeChartData }) {
  const footerItems = data.footerNotes.flatMap((note) =>
    note
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean),
  );

  return (
    <>
      <table
        className="w-full border-collapse border-spacing-0 text-center font-bold uppercase"
        aria-label="size-chart-table"
      >
        <thead className="break-keep bg-black p-1 text-white">
          <tr>
            <th />
            {data.variantNames.map((name) => (
              <th key={name}>{name}</th>
            ))}
          </tr>
        </thead>
        <tbody className="border-0 p-4">
          {data.measurements.map((row) => (
            <tr
              key={row.name}
              className="border-t border-solid border-t-[#e6e6e6] even:bg-[#f6f6f6]"
            >
              <td className="p-1">{row.name}</td>
              {row.measures.map((measure, index) => (
                <td key={`${row.name}-${index}`} className="p-1">
                  {measure}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {footerItems.length > 0 ? (
        <ul className="my-4 mt-2.5 block list-disc pl-[15px] uppercase">
          {footerItems.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

function TechnicalDetailsContent({
  technicalDetails,
}: {
  technicalDetails: ParsedTechnicalDetails;
}) {
  if (technicalDetails.html) {
    return (
      <div
        className={technicalDetailsContentClass}
        dangerouslySetInnerHTML={{ __html: technicalDetails.html }}
      />
    );
  }

  return (
    <div className={technicalDetailsContentClass}>
      
    
        {technicalDetails.lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
    
    </div>
  );
}

export default function ProductMetafieldModal({
  isOpen,
  onClose,
  productTitle,
  title,
  technicalDetails,
  sizeChart,
}: ProductMetafieldModalProps) {
  
  const isTechnicalDetails = Boolean(technicalDetails);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-white/75" />

      <div className="fixed inset-0">
        <DialogPanel
          className={clsx(
            isTechnicalDetails ? technicalDetailsPanelClass : sizeChartPanelClass,
          )}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="close-modal-button"
            className={closeBtnClass}
          >
            Close
          </button>

          {isTechnicalDetails && technicalDetails ? (
            <div aria-label="popover-modal" className="max-md:p-2">
              <h3 className={modalTitleClass}>
                {productTitle ?? title} Details
              </h3>
              <TechnicalDetailsContent technicalDetails={technicalDetails} />
            </div>
          ) : null}

          {!isTechnicalDetails ? (
            <div aria-label="popover-modal" className="max-md:p-2">
              <h3 className={sizeChartTitleClass}>
                {productTitle ? `${productTitle} Sizing` : (title ?? "Size Chart")}
              </h3>

              {sizeChart?.table ? <SizeChartTable data={sizeChart.table} /> : null}

              {sizeChart?.plainText ? (
                <p className="whitespace-pre-wrap font-normal uppercase">{sizeChart.plainText}</p>
              ) : null}
            </div>
          ) : null}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
