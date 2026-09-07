# Cuts the hero's scroll-scrubbed frame sets from the 4K master.
#   python3 assets-src/gen-hero-frames.py [assets-src/hero-dock-4k.mp4]
# Needs pillow, numpy, imageio-ffmpeg. Writes:
#   public/media/hero/d/0001..0096.webp   2560x1440, the wide desktop frame
#   public/media/hero/m/0001..0072.webp   810x1440, portrait centre crop for phones
# The portrait crop is what CSS object-cover shows of the wide frame on a
# phone, pre-cut so phones download a third of the pixels.
import os, subprocess, sys, tempfile, shutil
from PIL import Image
import imageio_ffmpeg

SRC = sys.argv[1] if len(sys.argv) > 1 else "assets-src/hero-dock-4k.mp4"
FF = imageio_ffmpeg.get_ffmpeg_exe()
SETS = [
    # (folder, frame count, output size, portrait crop?)
    ("public/media/hero/d", 96, (2560, 1440), False),
    ("public/media/hero/m", 72, (810, 1440), True),
]
QUALITY = 74

def duration(path):
    out = subprocess.run([FF, "-i", path], capture_output=True, text=True).stderr
    for line in out.splitlines():
        if "Duration:" in line:
            h, m, s = line.split("Duration:")[1].split(",")[0].strip().split(":")
            return int(h) * 3600 + int(m) * 60 + float(s)
    raise SystemExit("no duration")

dur = duration(SRC)
for folder, count, (w, h), portrait in SETS:
    tmp = tempfile.mkdtemp()
    # fps filter spreads `count` frames evenly over the clip
    fps = count / dur
    if portrait:
        # centre crop to the target aspect first, then scale
        vf = f"fps={fps:.6f},crop=ih*{w}/{h}:ih,scale={w}:{h}:flags=lanczos"
    else:
        vf = f"fps={fps:.6f},scale={w}:{h}:flags=lanczos"
    subprocess.run(
        [FF, "-y", "-loglevel", "error", "-i", SRC, "-vf", vf, "-frames:v", str(count),
         os.path.join(tmp, "%04d.png")],
        check=True,
    )
    shutil.rmtree(folder, ignore_errors=True)
    os.makedirs(folder, exist_ok=True)
    total = 0
    names = sorted(os.listdir(tmp))
    if len(names) < count:
        raise SystemExit(f"{folder}: got {len(names)} frames, wanted {count}")
    for i, name in enumerate(names[:count]):
        im = Image.open(os.path.join(tmp, name)).convert("RGB")
        out = os.path.join(folder, f"{i + 1:04d}.webp")
        im.save(out, quality=QUALITY, method=6)
        total += os.path.getsize(out)
    shutil.rmtree(tmp)
    print(f"{folder}: {count} frames {w}x{h}, {total / 1e6:.1f} MB total, {total / count / 1e3:.0f} KB avg")
