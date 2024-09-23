import React from "react";

export default function Stack({ children }: { children?: React.ReactNode }) {
  const childrenArray = React.Children.toArray(children);
  return (
    <div className="relative col-span-1">
      {childrenArray.map((child, index) => (
        <div
          key={index}
          className="card absolute"
          style={{ "--offset": index } as React.CSSProperties}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
