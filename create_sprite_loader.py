import os
import json
import traceback
from bs4 import BeautifulSoup
from math import sqrt
from PIL import Image

SPRITE_SIZE = 50

def create_sprite_sheet(img_dir, img_list):
	paths = [img_dir + "/" + f for f in os.listdir(img_dir) if not f.endswith(".txt")]
	try:
		with open(img_list, "r", encoding="utf-8") as f:
			last_images = f.read()
	except FileNotFoundError:
		last_images = ""
	these_images = ";".join(paths)
	if these_images == last_images:
		print("No change to spritesheet")
		return
	count = round(sqrt(len(paths)))
	sprite_width = SPRITE_SIZE * count
	sprite_height = SPRITE_SIZE * ((len(paths) - 1) // count + 1)

	sprite_sheet = Image.new("RGBA", (sprite_width, sprite_height), (0, 0, 0, 0))
	sprite_map = {}

	x, y = 0, 0
	for path in paths:
		img = Image.open(path)
		sprite_sheet.paste(img, (x, y))
		sprite_map[path] = (x, y)

		x += SPRITE_SIZE
		if x >= sprite_width:
			x = 0
			y += SPRITE_SIZE

	sprite_sheet.save("sprites.png")
	with open(img_list, "w", encoding="utf-8") as f:
		f.write(these_images)
	with open(os.path.join("src", "load-sprites.js"), "w", encoding="utf-8") as f:
		f.write(f"const SPRITE_SIZE  = {SPRITE_SIZE};\n\n")
		f.write("const SPRITE_COORDS = {\n")
		for path in paths[:-1]:
			x, y = sprite_map[path]
			f.write(f"\t\"{path}\": [{x}, {y}],\n")
		x, y = sprite_map[paths[-1]]
		f.write(f"\t\"{paths[-1]}\": [{x}, {y}]\n")
		f.write("""};

(function clearImgs(data) {
	if (data.img !== undefined) {
		data.spriteCoords = SPRITE_COORDS[data.img]
	}
	if (data.children !== undefined) {
		for (const entry2 of data.children) {
			clearImgs(entry2);
		}
	}
})(entryData);
""")

	print("Created spritesheet")
	return sprite_map

def main():
	os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), "docs"))
	img_dir  = "imgs"
	img_list = "../.images.txt"
	create_sprite_sheet(img_dir, img_list)

if __name__ == "__main__":
	try:
		main()
		input("SUCCESS")
	except:
		traceback.print_exc()
		input("ERROR")
