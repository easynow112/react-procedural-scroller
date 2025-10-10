interface Random {
  float: (min: number, max: number) => number;
  pickFromArray: <T>(array: T[]) => T;
  generateArray: <T>(length: number, callback: () => T) => T[];
}

export function getRandom(seed: number): Random {
  const mulberry = mulberry32(seed);
  const float = (min: number, max: number) => {
    if (typeof min !== "number" || typeof max !== "number" || max < min) {
      throw new Error(`Invalid min max values: ${min}, ${max}`);
    }
    return min + mulberry() * (max - min);
  };
  const pickFromArray = <T>(array: T[]) => {
    return array[Math.floor(float(0, array.length))];
  };
  const generateArray = <T>(length: number, callback: () => T): T[] => {
    return Array.from({ length }, () => callback());
  };
  return {
    float,
    pickFromArray,
    generateArray,
  };
}

export function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
