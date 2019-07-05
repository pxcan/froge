export function mid(a, b, c) {
    const x = a - b;
    const y = b - c;
    const z = a - c;
    if (x * y > 0) return b;
    if (x * z > 0) return c;
    return a;
}

export function clamp(value, absMax) {
    if (value <= -absMax) return -absMax;
    if (value >= absMax) return absMax;
    return value;
}
