import os
import json
import traceback
from bs4 import BeautifulSoup
from math import sqrt
from PIL import Image

def create_sprite_sheet(img_dir, image_size, img_list):
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

	sprite_sheet.save("sprites.png")
	with open(img_list, "w", encoding="utf-8") as f:
		f.write(these_images)
	with open(os.path.join("src", "load-sprites.js"), "w", encoding="utf-8") as f:
		f.write("const spriteCoords = {\n")
		for path in paths[:-1]:
			x, y = sprite_map[path]
			f.write(f"\t\"{path}\": [{x}, {y}],\n")
		x, y = sprite_map[paths[-1]]
		f.write(f"\t\"{paths[-1]}\": [{x}, {y}]\n")
		f.write("""};

// if run locally, loadSprites will not work for security reasons, so don't bother replacing links
if (window.location.protocol !== "file:") {
	(function clearImgs(data) {
		if (data.img !== undefined) {
			data.spriteCoords = spriteCoords[data.img]
			data.img = true; // needed to still render img element
		}
		if (data.children !== undefined) {
			for (const entry2 of data.children) {
				clearImgs(entry2);
			}
		}
	})(entryData);
}



function loadSprites() {
	if (window.location.protocol !== "file:") {
		const getCoords = (id, data=entryData) => {
			if (data.img !== undefined) {
				if (data.id == id) {
					return data.spriteCoords;
				}
			}
			if (data.children !== undefined) {
				for (const entry2 of data.children) {
					let coords = getCoords(id, entry2);
					if (coords != null) {
						return coords;
					}
				}
			}
			return null;
		}

		const spritesheet = new Image();
		spritesheet.src = "./sprites.png";
		spritesheet.onload = () => {

			document.querySelectorAll(".entry").forEach(entryElement => {
				const title = entryElement.querySelector("a").innerText;
				const img = entryElement.querySelector("img");
				const id = entryElement.getAttribute("id");
				if (img !== undefined) {
					const coords = getCoords(id);
					if (coords === null) {
						console.log("Could not find spritesheet coords for: " + id);
					} else {
						const [x, y] = coords;
						const canvas = document.createElement("canvas");
						const ctx = canvas.getContext("2d");
						const cropWidth = 50;
						const cropHeight = 50;
						canvas.width = cropWidth;
						canvas.height = cropHeight;
						ctx.drawImage(spritesheet, x, y, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
						img.src = canvas.toDataURL();
					}
				}
			});
		};
	}
}
""")

	print("Created spritesheet")
	return sprite_map

def main():
	os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), "docs"))
	img_list = os.path.join("../.images.txt")
	img_map = create_sprite_sheet("imgs", 50, img_list)

if __name__ == "__main__":
	try:
		main()
		input("SUCCESS")
	except:
		traceback.print_exc()
		input("ERROR")
