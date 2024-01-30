from nicegui import ui, app
from pdf_renderer import PDFRenderer


app.add_static_file(local_file="resources.js", url_path="/static/resources.js")
# app.add_static_file(local_file="pdf.min.js", url_path="/static/pdf.min.js")
app.add_static_file(local_file="CreatingWithCodeV1.pdf", url_path="/static/CreatingWithCodeV1.pdf")
ui.label("Hi")
renderer = PDFRenderer(pdf_path='/static/CreatingWithCodeV1.pdf').style("position: absolute; right: 100px; top: -100px;")
index =0 


def temp():
    print(renderer._props['numPages'])

ui.button("num pages", on_click=temp)
ui.run()