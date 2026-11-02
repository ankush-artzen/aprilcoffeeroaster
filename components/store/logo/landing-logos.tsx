export const TRI_FERG_LOGOS = {
  black: "/homelogos/grey-horse-1.png",
  blue: "/homelogos/green-horse-2.png",
  green: "/homelogos/black-horse-3.png",
  red: "/homelogos/blue-horse-4.png",
  white: "/homelogos/orange-horse-5.png",
} as const;

export type TriFergLogoId = keyof typeof TRI_FERG_LOGOS;

const FILL_CLASS_TO_LOGO: Record<string, TriFergLogoId> = {
  "fill-tri-ferg-red": "red",
  "fill-tri-ferg-blue": "blue",
  "fill-tri-ferg-grey": "white",
  "fill-tri-ferg-lime-green": "green",
};

const MARK_ID_TO_LOGO: Record<string, TriFergLogoId> = {
  grey: "white",
  blue: "blue",
  red: "red",
  green: "green",
  black: "black",
  white: "white",
};

export function triFergLogoFromFillClass(fillClass: string): TriFergLogoId {
  return FILL_CLASS_TO_LOGO[fillClass] ?? "black";
}

export function triFergLogoFromMarkId(id: string): TriFergLogoId {
  return MARK_ID_TO_LOGO[id] ?? "black";
}

export function TriFergSvg({
  className,
  logo = "black",
}: {
  className?: string;
  logo?: TriFergLogoId;
}) {
  return (
    <img
      src={TRI_FERG_LOGOS[logo]}
      alt=""
      className={className ?? "h-auto w-full"}
      aria-hidden
    />
  );
}
