

from nicegui import ui, app
from pdf_renderer import PDFRenderer
import fitz
from PIL import Image
from io import BytesIO
import cv2
import numpy as np
import base64



pdf_doc = fitz.open("static/MATH_1B03_midterm1_Version1.pdf")
app.add_static_file(local_file="resources.js", url_path="/static/resources.js")
app.add_static_file(local_file="static/MATH_1B03_midterm1_Version1.pdf", url_path="/static/MATH_1B03_midterm1_Version1.pdf")

def get_image(page_num, zoom=2):
            print(page_num)
            page = pdf_doc.load_page(page_num)
            if zoom:
                mat = fitz.Matrix(zoom, zoom)
                pix = page.get_pixmap(matrix=mat)
            else:
                pix = page.get_pixmap()
            px1 = fitz.Pixmap(pix, 0) if pix.alpha else pix
            imgdata = px1.tobytes('ppm')
            return Image.open(BytesIO(imgdata))



def get_boundary_points(coordinates):
                  min_x = float('inf')
                  min_y = float('inf')
                  max_x = float('-inf')
                  max_y = float('-inf')

                  for point in coordinates:
                    # for point in page_coordinates:
                      print("point", point)
                      x = point['x']
                      y = point['y']
                      min_x = min(min_x, x)
                      min_y = min(min_y, y)
                      max_x = max(max_x, x)
                      max_y = max(max_y, y)

                  return min_x, min_y, max_x, max_y

with ui.row():
    with ui.column().style("width: 500px; overflow-y: auto;"):
            
        renderer = PDFRenderer(pdf_path='/static/MATH_1B03_midterm1_Version1.pdf').style("width: 500px; overflow-y: auto;")

    with ui.column():
        menu = ui.menu().style("width: 500px; height: 500px; background-color: black; position: absolute; top: 100px;")
        menu.set_visibility(False)

        def temp():
            # ui.label("Hi frank")

            page_number = renderer._props['mostPreviousPageNumber']
            coordinates = renderer._props['allPoints']
            cv_image = cv2.cvtColor(np.array(get_image(page_number)), cv2.COLOR_BGR2RGB)
            x_ratio = 459 / cv_image.shape[1]
            y_ratio = 594 / cv_image.shape[0]
            x_ratio = 1 / x_ratio
            y_ratio = 1 / y_ratio

            for point in coordinates[page_number]:
                cv2.circle(cv_image, (int(x_ratio * point['x']), int(y_ratio * point['y'])), 5, (0, 0, 255), -1)

            # Crop around the points where circles are placed
            x_min, y_min, x_max, y_max = get_boundary_points(coordinates[page_number])
            cropped_image = cv_image[int(y_ratio * y_min):int(y_ratio * y_max), int(x_ratio * x_min):int(x_ratio * x_max)]

            # Convert to base64 string
            cv2.imwrite("temp.png", cropped_image)
            app.remove_route("/static/temp.png")
            
            path = app.add_static_file(local_file="temp.png", url_path="/static/temp.png", single_use=True)
            print("Path: ", path)
            menu.set_visibility(True)
            with menu:
                ui.image(path).style("max-width: 100%; max-height: 40%; position: absolute; top: 0px; left: 0px;")
                print("Got image, and menu!")
                ui.label("Hi frank")


        ui.button("Run OCR", on_click=lambda: temp())
        def temp_render():
            ui.image("temp.png").style("width: 100px; height: 100px; position: absolute; top: 100px; left: 100px;")
        ui.button("Render proper image: ", on_click=lambda: temp_render())

ui.run()