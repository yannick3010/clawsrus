import clsx from "clsx";

type ButtonProps = {
  variant?: "primary" | "secondary" | "outline";
  href?: string;
  children: React.ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const base =
  "inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-medium uppercase tracking-wider transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta";

const variants = {
  primary: "bg-terracotta text-cream hover:bg-terracotta-dark",
  secondary: "bg-cream-dark text-charcoal hover:bg-warm-gray",
  outline:
    "border border-terracotta text-terracotta hover:bg-terracotta hover:text-cream",
};

export default function Button({
  variant = "primary",
  href,
  children,
  className,
  ...props
}: ButtonProps) {
  const classes = clsx(base, variants[variant], className);

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
