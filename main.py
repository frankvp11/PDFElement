from nicegui import ui, app
from pdf_renderer import PDFRenderer
import fitz
from PIL import Image
from io import BytesIO
import cv2
import numpy as np

pdf_doc = fitz.open("CreatingWithCodeV1.pdf")
app.add_static_file(local_file="resources.js", url_path="/static/resources.js")
app.add_static_file(local_file="CreatingWithCodeV1.pdf", url_path="/static/CreatingWithCodeV1.pdf")
renderer = PDFRenderer(pdf_path='/static/CreatingWithCodeV1.pdf').style("position: absolute; right: 100px; top: -100px;")


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



def temp():
    page_number = renderer._props['mostPreviousPageNumber']
    coordinates = renderer._props['allPoints']
    cv_image = cv2.cvtColor(np.array(get_image(page_number)), cv2.COLOR_BGR2RGB)
    x_ratio = 459 / cv_image.shape[1]
    y_ratio = 594 / cv_image.shape[0]
    x_ratio = 1 / x_ratio
    y_ratio = 1 / y_ratio
    for point in coordinates[page_number]:
        cv2.circle(cv_image, (int(x_ratio * point['x']), int(y_ratio * point['y'])), 5, (0, 0, 255), -1)
    cv2.imwrite("temp.jpg", cv_image)


    with ui.card().style("width: 500px; height: 500px; background-color: black; position: absolute; top: 25%; left: 25%;"):
          ui.image(get_image(page_number)).style("width: 100%; height: 30%; position: absolute; top: 0; left: 0;")
          print("Got image, and menu!")



ui.button("Run OCR", on_click=temp)

ui.run()