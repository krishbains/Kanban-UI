import React, { useState, Fragment } from 'react';
import Wheel from '@uiw/react-color-wheel';
import ShadeSlider from '@uiw/react-color-shade-slider';
import { hsvaToHex } from '@uiw/color-convert';

export interface ColourWheelProps {
  onColourPick?: (hex: string, hsva: { h: number; s: number; v: number; a: number }) => void;
  initialHsva?: { h: number; s: number; v: number; a: number };
}

function ColourWheel({ onColourPick, initialHsva }: ColourWheelProps) {
  const [hsva, setHsva] = useState(initialHsva || { h: 214, s: 43, v: 90, a: 1 });
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleChange = (color: any) => {
    const newHsva = { ...hsva, ...color.hsva };
    setHsva(newHsva);
    if (timeoutId) clearTimeout(timeoutId);
    if (onColourPick) {
      const hex = hsvaToHex(newHsva);
      const id = setTimeout(() => onColourPick(hex, newHsva), 10);
      setTimeoutId(id);
    }
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
          if (timeoutId) clearTimeout(timeoutId);
          if (onColourPick) {
            const hex = hsvaToHex(newHsva);
            const id = setTimeout(() => onColourPick(hex, newHsva), 10);
            setTimeoutId(id);
          }
        }}
      />
      {/* <div style={{ width: '20%', height: 34, marginTop: 20, background: hsvaToHex(hsva) }}></div> */}
    </Fragment>
  );
}

export { ColourWheel };
export default ColourWheel;