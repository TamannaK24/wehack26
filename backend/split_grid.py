from PIL import Image
import os

# load the grid image
grid_image = Image.open("grid.jpg")  # rename your file to grid.jpg first

# grid dimensions — adjust these if wrong
cols = 8
rows = 5

# calculate individual image size
grid_width, grid_height = grid_image.size
img_width  = grid_width // cols
img_height = grid_height // rows

# create output folder
os.makedirs("test_photos", exist_ok=True)

# split and save each photo
count = 1
for row in range(rows):
    for col in range(cols):
        left   = col * img_width
        top    = row * img_height
        right  = left + img_width
        bottom = top  + img_height

        cropped = grid_image.crop((left, top, right, bottom))
        if cropped.mode == "RGBA":
            cropped = cropped.convert("RGB")
        cropped.save(f"test_photos/photo_{count:03d}.jpg")
        count += 1

print(f"Saved {count-1} individual photos to test_photos/")