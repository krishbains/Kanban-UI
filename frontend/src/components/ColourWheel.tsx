import React, { useState, Fragment, useRef } from 'react';
import Wheel from '@uiw/react-color-wheel';
import ShadeSlider from '@uiw/react-color-shade-slider';
import { hsvaToHex } from '@uiw/color-convert';
// import type { ColorResult } from '@uiw/react-color-wheel'; // Not exported, fallback to any

export interface ColourWheelProps {
  onColourPick?: (hex: string, hsva: { h: number; s: number; v: number; a: number }) => void;
  initialHsva?: { h: number; s: number; v: number; a: number };
}

function ColourWheel({ onColourPick, initialHsva }: ColourWheelProps) {
  const [hsva, setHsva] = useState(initialHsva || { h: 214, s: 43, v: 90, a: 1 });
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const triggerColourPick = (newHsva: typeof hsva) => {
    if (onColourPick) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onColourPick(hsvaToHex(newHsva), newHsva);
      }, 100);
    }
  };

  // The color parameter type is 'any' because @uiw/react-color-wheel does not export ColorResult
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (color: any) => {
    const newHsva = { ...hsva, ...color.hsva };
    setHsva(newHsva);
    triggerColourPick(newHsva);
  };

  return (
    <Fragment>
      <Wheel color={hsva} onChange={handleChange} />
      <ShadeSlider
        hsva={hsva}
        style={{ width: 210, marginTop: 20 }}
        onChange={(newShade) => {
          const newHsva = { ...hsva, ...newShade };
          setHsva(newHsva);
          triggerColourPick(newHsva);
        }}
      />
      {/* <div style={{ width: '20%', height: 34, marginTop: 20, background: hsvaToHex(hsva) }}></div> */}
    </Fragment>
  );
}

export { ColourWheel };
export default ColourWheel;