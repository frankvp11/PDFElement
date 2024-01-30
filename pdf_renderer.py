from pathlib import Path
from typing import Any, Callable, Dict, List, Optional

from nicegui.element import Element
from nicegui.events import handle_event


class PDFRenderer(Element, component='pdf_rendering_better.js'):

    def __init__(self, pdf_path) -> None:
        """


        """
        super().__init__()
        self._props['pdf_path'] = pdf_path
        self.on("PagesUpdated", lambda e:  self.update_pages(e))        

    # def render_page(self, pagenumber:int):
    #     print("Rendering page!")
    #     self.run_method("renderPage", pagenumber)


    def update_pages(self, event):
        print(event)
        self._props["numPages"] = event.args['pages']
        for i in range(1, event.args['pages']+1):
            self.run_method("renderPage", i)
        print("Done")