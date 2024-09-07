import React from "react";

export default function Stack({ children }: { children?: React.ReactNode }) {
  const childrenArray = React.Children.toArray(children);
  return (
    <div className="relative">
      {childrenArray.map((child, index) => (
        <div
          key={index}
          className="absolute"
          style={{ top: `${index * 32}px` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
