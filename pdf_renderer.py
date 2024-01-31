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
        self.on("all_points", lambda e:  self.update_points(e))   
        self.on("mostPreviousPageNumber", lambda e : self.update_most_previous_page_number(e))

    def update_points(self, event):
        # print(event)
        # print("EVent")
        # print(event.args['all_points'])
        # print("Props")
        # print(self._props)
        self._props['allPoints'][event.args['pagenumber']] = event.args['all_points']
        # print(self._props['allPoints'])

    def update_most_previous_page_number(self, event):
        self._props["mostPreviousPageNumber"] = event.args['previousPageNumber']

    def update_pages(self, event):
        # print(event)
        self._props["numPages"] = event.args['pages']
        self._props['allPoints'] = {i:[] for i in range(event.args['pages'])}
