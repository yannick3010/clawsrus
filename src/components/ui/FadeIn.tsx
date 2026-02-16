"use client";

import clsx from "clsx";
import useIntersectionObserver from "@/hooks/useIntersectionObserver";

type FadeInProps = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
};

export default function FadeIn({ children, delay = 0, className }: FadeInProps) {
  const { ref, visible } = useIntersectionObserver();

  return (
    <div
      ref={ref}
      className={clsx("opacity-0", visible && "animate-fade-in-up", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
