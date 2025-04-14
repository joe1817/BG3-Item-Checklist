import os
import json
from bs4 import BeautifulSoup
import traceback
from math import sqrt
from PIL import Image

def create_sprite_sheet(img_dir, image_size, out_dir):
	paths = [img_dir + "/" + f for f in os.listdir(img_dir) if not f.endswith(".txt")]
	try:
		with open(os.path.join(img_dir, "sprite_images.txt"), "r", encoding="utf-8") as f:
			last_images = f.read()
	except FileNotFoundError:
		last_images = ""
	these_images = ";".join(paths)
	if these_images == last_images:
		print("No change to spritesheet")
		with open(os.path.join(img_dir, "sprite_map.txt"), "r", encoding="utf-8") as f:
			return json.loads(f.read())
	count = round(sqrt(len(paths)))
	sprite_width = image_size * count
	sprite_height = image_size * ((len(paths) - 1) // count + 1)

	sprite_sheet = Image.new("RGBA", (sprite_width, sprite_height), (0, 0, 0, 0))
	sprite_map = {}

	x, y = 0, 0
	for path in paths:
		img = Image.open(path)
		sprite_sheet.paste(img, (x, y))
		sprite_map[path] = (x, y)

		x += image_size
		if x >= sprite_width:
			x = 0
			y += image_size

	sprite_sheet.save(os.path.join(out_dir, "sprites.png"))
	with open(os.path.join(img_dir, "sprite_images.txt"), "w", encoding="utf-8") as f:
		f.write(these_images)
	with open(os.path.join(img_dir, "sprite_map.txt"), "w", encoding="utf-8") as f:
		f.write(json.dumps(sprite_map))
	print("Created spritesheet")
	return sprite_map

def update_links(in_file, img_map, out_dir):
	with open(in_file, "r", encoding="utf-8") as f:
		html = f.read()
	for path, coords in img_map.items():
		if path not in html:
			print(f"unused picture: {path}")
		html = html.replace(
			f'<img src="{path}"',
			f'<img class="sprite" id="{coords[0]}-{coords[1]}"'
		)
	html = str(BeautifulSoup(html, "lxml"))
	with open(os.path.join(out_dir, "index.html"), "w", encoding="utf-8") as f:
		f.write(html)
	print("Created index.html")

def main():
	os.chdir(os.path.dirname(os.path.abspath(__file__)))
	img_map = create_sprite_sheet("imgs", 50, "docs")
	update_links("src.html", img_map, "docs")

if __name__ == "__main__":
	try:
		main()
	except:
		traceback.print_exc()
		input("ERROR")
