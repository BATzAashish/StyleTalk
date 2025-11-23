"""
Generate placeholder icon files for Chrome extension
Creates simple purple gradient PNG files
"""
from PIL import Image, ImageDraw, ImageFont
import os

# Icon sizes required
sizes = [16, 32, 48, 128]

# Create icons directory if it doesn't exist
icons_dir = os.path.join(os.path.dirname(__file__), 'icons')
os.makedirs(icons_dir, exist_ok=True)

# Colors for gradient (purple to pink)
color_start = (102, 126, 234)  # #667eea
color_end = (118, 75, 162)     # #764ba2

for size in sizes:
    # Create a new image with gradient
    img = Image.new('RGB', (size, size), color_start)
    draw = ImageDraw.Draw(img)
    
    # Create gradient effect
    for i in range(size):
        # Calculate color for this row
        ratio = i / size
        r = int(color_start[0] + (color_end[0] - color_start[0]) * ratio)
        g = int(color_start[1] + (color_end[1] - color_start[1]) * ratio)
        b = int(color_start[2] + (color_end[2] - color_start[2]) * ratio)
        
        draw.line([(0, i), (size, i)], fill=(r, g, b))
    
    # Add sparkle emoji or "ST" text
    if size >= 32:
        try:
            # Try to use system font
            font_size = int(size * 0.6)
            font = ImageFont.truetype("seguiemj.ttf", font_size)  # Windows emoji font
            text = "✨"
        except:
            try:
                # Fallback to regular font with text
                font_size = int(size * 0.4)
                font = ImageFont.truetype("arial.ttf", font_size)
                text = "ST"
            except:
                # Last resort: default font
                font = ImageFont.load_default()
                text = "ST"
        
        # Center the text
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        x = (size - text_width) // 2
        y = (size - text_height) // 2 - bbox[1]
        
        # Draw text with white color
        draw.text((x, y), text, fill=(255, 255, 255), font=font)
    
    # Save the icon
    filename = f'icon{size}.png'
    filepath = os.path.join(icons_dir, filename)
    img.save(filepath, 'PNG')
    print(f'✅ Created {filename} ({size}x{size})')

print('\n✅ All icon files created successfully!')
print(f'   Location: {icons_dir}')
print('\nYou can now load the extension in Chrome!')
