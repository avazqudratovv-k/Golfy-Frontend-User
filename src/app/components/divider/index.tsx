import React from "react";

interface Props {
  height: string;
  width: string;
  bg: string;
}

export default function Divider({ height, width, bg }: Props) {
  return (
    <div
      style={{
        height: `${height}px`,
        width: `${width}px`,
        background: bg,
      }}
    />
  );
}
