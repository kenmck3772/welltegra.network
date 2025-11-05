#!/bin/bash

# Well-Tegra Image Optimization Script
# Converts JPG/PNG images to WebP format for better web performance
# Reduces file sizes by 25-35% without visible quality loss

set -e

echo "========================================="
echo "Well-Tegra Image Optimization Tool"
echo "========================================="
echo ""

# Check if cwebp is installed
if ! command -v cwebp &> /dev/null; then
    echo "Error: cwebp is not installed."
    echo ""
    echo "Install on Ubuntu/Debian:"
    echo "  sudo apt-get install webp"
    echo ""
    echo "Install on macOS:"
    echo "  brew install webp"
    echo ""
    exit 1
fi

# Configuration
ASSETS_DIR="./assets"
QUALITY=80  # 80 is optimal balance between quality and size
BACKUP_DIR="${ASSETS_DIR}/originals"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Counter for statistics
total_images=0
total_original_size=0
total_optimized_size=0

echo "Starting image optimization..."
echo "Source directory: $ASSETS_DIR"
echo "Quality setting: $QUALITY"
echo "Backup directory: $BACKUP_DIR"
echo ""

# Function to convert image to WebP
convert_to_webp() {
    local input_file="$1"
    local filename=$(basename "$input_file")
    local name_no_ext="${filename%.*}"
    local output_file="${ASSETS_DIR}/${name_no_ext}.webp"

    # Skip if already a WebP file
    if [[ "$filename" == *.webp ]]; then
        return
    fi

    # Skip if not an image file
    if [[ ! "$filename" =~ \.(jpg|jpeg|png|JPG|JPEG|PNG)$ ]]; then
        return
    fi

    echo "Processing: $filename"

    # Get original file size
    original_size=$(stat -f%z "$input_file" 2>/dev/null || stat -c%s "$input_file" 2>/dev/null)

    # Convert to WebP
    if cwebp -q $QUALITY "$input_file" -o "$output_file" -quiet; then
        # Get new file size
        new_size=$(stat -f%z "$output_file" 2>/dev/null || stat -c%s "$output_file" 2>/dev/null)

        # Calculate savings
        savings=$((original_size - new_size))
        savings_percent=$((100 * savings / original_size))

        echo "  ✓ Created: ${name_no_ext}.webp"
        echo "    Original: $(numfmt --to=iec-i --suffix=B $original_size 2>/dev/null || echo "${original_size} bytes")"
        echo "    Optimized: $(numfmt --to=iec-i --suffix=B $new_size 2>/dev/null || echo "${new_size} bytes")"
        echo "    Saved: ${savings_percent}%"

        # Backup original
        cp "$input_file" "$BACKUP_DIR/"
        echo "    Backed up to: $BACKUP_DIR/$filename"

        # Update statistics
        ((total_images++))
        total_original_size=$((total_original_size + original_size))
        total_optimized_size=$((total_optimized_size + new_size))
    else
        echo "  ✗ Failed to convert: $filename"
    fi

    echo ""
}

# Process all images in assets directory
for file in "$ASSETS_DIR"/*.{jpg,jpeg,png,JPG,JPEG,PNG}; do
    # Check if file actually exists (glob might not match)
    if [ -f "$file" ]; then
        convert_to_webp "$file"
    fi
done

# Print summary statistics
echo "========================================="
echo "Optimization Complete!"
echo "========================================="
echo ""
echo "Images processed: $total_images"

if [ $total_images -gt 0 ]; then
    total_savings=$((total_original_size - total_optimized_size))
    total_savings_percent=$((100 * total_savings / total_original_size))

    echo "Total original size: $(numfmt --to=iec-i --suffix=B $total_original_size 2>/dev/null || echo "${total_original_size} bytes")"
    echo "Total optimized size: $(numfmt --to=iec-i --suffix=B $total_optimized_size 2>/dev/null || echo "${total_optimized_size} bytes")"
    echo "Total space saved: $(numfmt --to=iec-i --suffix=B $total_savings 2>/dev/null || echo "${total_savings} bytes") (${total_savings_percent}%)"
    echo ""
    echo "Next steps:"
    echo "1. Update HTML/CSS to use .webp versions with fallbacks"
    echo "2. Test in browsers (Chrome, Firefox, Safari)"
    echo "3. Consider removing originals after verification"
    echo "4. Original files backed up in: $BACKUP_DIR"
else
    echo "No images found to optimize."
    echo ""
    echo "Supported formats: JPG, JPEG, PNG"
fi

echo ""
echo "Example HTML usage with fallback:"
echo '<picture>'
echo '  <source srcset="assets/logo.webp" type="image/webp">'
echo '  <img src="assets/logo.jpg" alt="Well-Tegra Logo">'
echo '</picture>'
echo ""
