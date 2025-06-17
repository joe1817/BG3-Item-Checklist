import os
import json
import traceback
from bs4 import BeautifulSoup
from math import sqrt
from PIL import Image

def create_sprite_sheet(img_dir, image_size, out_dir):
	paths = [img_dir + "/" + f for f in os.listdir(img_dir) if not f.endswith(".txt")]
	try:
		with open(".images.txt", "r", encoding="utf-8") as f:
			last_images = f.read()
	except FileNotFoundError:
		last_images = ""
	these_images = ";".join(paths)
	if these_images == last_images:
		print("No change to spritesheet")
	#	with open(os.path.join(img_dir, "sprite_map.txt"), "r", encoding="utf-8") as f:
	#		return json.loads(f.read())
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

	sprite_sheet.save(os.path.join(out_dir, "sprites.png"))
	with open(".images.txt", "w", encoding="utf-8") as f:
		f.write(these_images)
	#with open("_sprite_map.txt", "w", encoding="utf-8") as f:
	#	f.write(json.dumps(sprite_map))
	with open("load-sprites.js", "w", encoding="utf-8") as f:
		f.write("const sprite_coords = {\n")
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
				if (img !== undefined) {
					const [x, y] = getCoords(entryElement.getAttribute("id"));
					if (x !== undefined && y !== undefined) {
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

# def update_links(in_file, img_map, out_dir):
# 	with open(in_file, "r", encoding="utf-8") as f:
# 		html = f.read()
# 	for path, coords in img_map.items():
# 		if path not in html:
# 			print(f"unused picture: {path}")
# 		html = html.replace(
# 			f'<img src="{path}"',
# 			f'<img class="sprite" id="{coords[0]}-{coords[1]}"'
# 		)
# 	html = str(BeautifulSoup(html, "lxml"))
# 	with open(os.path.join(out_dir, "index.html"), "w", encoding="utf-8") as f:
# 		f.write(html)
# 	print("Created index.html")

def main():
	os.chdir(os.path.dirname(os.path.abspath(__file__)))
	img_map = create_sprite_sheet("docs/imgs", 50, ".")
	#update_links("src.html", img_map, "docs")

if __name__ == "__main__":
	try:
		main()
		input("SUCCESS")
	except:
		traceback.print_exc()
		input("ERROR")
