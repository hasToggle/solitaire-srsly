"use client";

import clsx from "clsx";

export default function Button(props: React.HTMLProps<HTMLButtonElement>) {
  const { children, className, onClick, disabled } = props;
  return (
    <button
      className={clsx(
        className,
        "rounded-md border border-sky-700/80 bg-gray-800/70 px-8 py-1.5 text-white/80 transition ease-in-out",
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
