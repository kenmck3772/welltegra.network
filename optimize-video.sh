#!/bin/bash
# WellTegra Video Optimization Script
# Run this on your local machine where hero33.mp4 exists

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "ffmpeg is not installed. Install it first:"
    echo "  macOS: brew install ffmpeg"
    echo "  Ubuntu: sudo apt install ffmpeg"
    echo "  Windows: winget install ffmpeg"
    exit 1
fi

INPUT_VIDEO="hero33.mp4"
OUTPUT_VIDEO="hero33-optimized.mp4"
OUTPUT_WEBM="hero33-optimized.webm"
POSTER_IMAGE="hero-poster.jpg"

# Check if input video exists
if [ ! -f "$INPUT_VIDEO" ]; then
    echo "Error: $INPUT_VIDEO not found in current directory"
    exit 1
fi

echo "=== WellTegra Video Optimization ==="
echo ""
echo "Input video: $INPUT_VIDEO"
echo "Original size: $(du -h "$INPUT_VIDEO" | cut -f1)"
echo ""

# Step 1: Create poster image from first frame
echo "[1/4] Creating poster image..."
ffmpeg -y -i "$INPUT_VIDEO" -vframes 1 -q:v 2 "$POSTER_IMAGE" 2>/dev/null
echo "  Created: $POSTER_IMAGE ($(du -h "$POSTER_IMAGE" | cut -f1))"

# Step 2: Compress MP4 with H.264
echo "[2/4] Compressing MP4 (this may take a few minutes)..."
ffmpeg -y -i "$INPUT_VIDEO" \
    -c:v libx264 \
    -crf 28 \
    -preset slow \
    -c:a aac \
    -b:a 96k \
    -movflags +faststart \
    -vf "scale=1280:-2" \
    "$OUTPUT_VIDEO" 2>/dev/null

echo "  Created: $OUTPUT_VIDEO ($(du -h "$OUTPUT_VIDEO" | cut -f1))"

# Step 3: Create WebM version (even smaller)
echo "[3/4] Creating WebM version (this may take longer)..."
ffmpeg -y -i "$INPUT_VIDEO" \
    -c:v libvpx-vp9 \
    -crf 30 \
    -b:v 0 \
    -c:a libopus \
    -b:a 64k \
    -vf "scale=1280:-2" \
    "$OUTPUT_WEBM" 2>/dev/null

echo "  Created: $OUTPUT_WEBM ($(du -h "$OUTPUT_WEBM" | cut -f1))"

# Step 4: Summary
echo ""
echo "[4/4] Optimization Complete!"
echo ""
echo "=== Results ==="
echo "Original:     $(du -h "$INPUT_VIDEO" | cut -f1)"
echo "Optimized MP4: $(du -h "$OUTPUT_VIDEO" | cut -f1)"
echo "Optimized WebM: $(du -h "$OUTPUT_WEBM" | cut -f1)"
echo "Poster:        $(du -h "$POSTER_IMAGE" | cut -f1)"
echo ""
echo "=== Next Steps ==="
echo "1. Upload $OUTPUT_VIDEO to your GitHub repo"
echo "2. Upload $POSTER_IMAGE as the video poster"
echo "3. Update your HTML to use the new video filename"
echo ""
echo "HTML code to use:"
echo '<video autoplay muted loop playsinline preload="none" poster="assets/hero-poster.jpg">'
echo '    <source src="hero33-optimized.webm" type="video/webm">'
echo '    <source src="hero33-optimized.mp4" type="video/mp4">'
echo '</video>'
