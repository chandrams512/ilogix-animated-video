#!/usr/bin/env python3
"""Remove the background from a product photo so the `product` scene can float it. Usage: python3 engine/cutout.py photo.jpg out.png
Needs `pip install rembg onnxruntime` (the first run downloads a small model). The product pixels are kept exactly as shot; only the background is made transparent.
Check the edges before using it: pale products on pale backgrounds can lose a rim. Or use any cut-out PNG you already have."""
import sys
try: from rembg import remove
except ImportError: sys.exit('Install first:  pip install rembg onnxruntime')
from PIL import Image
if len(sys.argv) < 3: sys.exit(__doc__)
remove(Image.open(sys.argv[1]).convert('RGBA')).save(sys.argv[2]); print('wrote', sys.argv[2])
