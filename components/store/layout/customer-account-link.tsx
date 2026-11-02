export const CUSTOMER_ACCOUNT_HREF = "/account";
export const CUSTOMER_ACCOUNT_LABEL = "My Account";

export default function CustomerAccountLink({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  return (
    <a href={CUSTOMER_ACCOUNT_HREF} className={className} onClick={onClick}>
      {CUSTOMER_ACCOUNT_LABEL}
    </a>
  );
}
