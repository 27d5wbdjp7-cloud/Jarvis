"""Erzeugt die App-Icons (PNG) ohne externe Bibliotheken.

Motiv: ein leuchtender Ring auf dunklem Grund (Arc-Reactor-Anmutung).
Aufruf: python tools/make_icons.py
"""
import math
import os
import struct
import zlib

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "icons")

BG = (14, 20, 27)          # --bg dunkel
RING = (226, 166, 74)      # Akzent (Bernstein)
CORE = (255, 232, 190)     # heller Kern
GLOW = (120, 84, 30)


def lerp(a, b, t):
    return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3))


def pixel(x, y, size, maskable):
    cx = cy = size / 2
    d = math.hypot(x - cx, y - cy) / (size / 2)  # 0 = Mitte, 1 = Rand
    # Bei maskable-Icons muss das Motiv in der inneren 80%-Zone liegen.
    scale = 0.78 if maskable else 1.0
    d = d / scale
    col = BG
    # weiches Glühen hinter dem Ring
    glow = max(0.0, 1 - abs(d - 0.56) / 0.3)
    col = lerp(col, GLOW, glow * 0.6)
    # Hauptring
    ring = max(0.0, 1 - abs(d - 0.56) / 0.07)
    col = lerp(col, RING, min(1.0, ring * 1.4))
    # dünner Innenring
    inner = max(0.0, 1 - abs(d - 0.36) / 0.025)
    col = lerp(col, RING, min(1.0, inner * 1.2) * 0.8)
    # Kern
    core = max(0.0, 1 - d / 0.17)
    col = lerp(col, CORE, min(1.0, core * 1.3))
    # Ticks (12 Markierungen) auf dem Außenring
    ang = math.atan2(y - cy, x - cx)
    tick = abs(((ang / (2 * math.pi) * 12) % 1) - 0.5) < 0.04 and 0.66 < d < 0.74
    if tick:
        col = lerp(col, RING, 0.9)
    return col


def png(size, maskable=False):
    raw = bytearray()
    for y in range(size):
        raw.append(0)  # Filter: none
        for x in range(size):
            raw.extend(pixel(x + 0.5, y + 0.5, size, maskable))

    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        return c + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0)
    return (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr)
            + chunk(b"IDAT", zlib.compress(bytes(raw), 9)) + chunk(b"IEND", b""))


def main():
    os.makedirs(OUT, exist_ok=True)
    jobs = [
        ("icon-192.png", 192, False),
        ("icon-512.png", 512, False),
        ("maskable-512.png", 512, True),
        ("maskable-192.png", 192, True),
        ("apple-touch-icon.png", 180, False),
        ("favicon-64.png", 64, False),
    ]
    for name, size, maskable in jobs:
        with open(os.path.join(OUT, name), "wb") as f:
            f.write(png(size, maskable))
        print("ok", name)


if __name__ == "__main__":
    main()
