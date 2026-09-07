# Generates public/media/fx-ground.{webp,jpg}: the near-white speckle tile the
# reveal rolls under the truck. Mirror-stacked so the 50% loop seam is invisible.
# Run from the repo root: python3 assets-src/gen-ground.py  (needs pillow numpy scipy)
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter
rng = np.random.default_rng(7)
W, H = 360, 1500
base = 241.0
fine = gaussian_filter(rng.normal(0, 1, (H, W)), 1.1); fine *= 3.2 / fine.std()
coarse = gaussian_filter(rng.normal(0, 1, (H, W)), 9); coarse *= 2.2 / coarse.std()
img = base + fine + coarse
# soften the top/bottom so the mirror seam has no gradient step
tile = np.concatenate([img, img[::-1]], axis=0)  # 3000 rows, seamless when looped
tile = np.clip(tile, 0, 255)
rgb = np.stack([tile, tile, tile * 0.998], axis=2).astype(np.uint8)
im = Image.fromarray(rgb, 'RGB')
im.save('public/media/fx-ground.webp', quality=82, method=6)
im.save('public/media/fx-ground.jpg', quality=82, optimize=True)
print(tile.shape, 'min', tile.min().round(1), 'max', tile.max().round(1), 'std', tile.std().round(2))
import os
print('webp', os.path.getsize('public/media/fx-ground.webp'), 'jpg', os.path.getsize('public/media/fx-ground.jpg'))
