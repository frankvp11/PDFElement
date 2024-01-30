import {loadResource } from "/static/resources.js";

export default {
  template: "<div></div>",
  props:
    {
        pdf_path: String,
        numPages : Number,
    },
    

  async mounted() {

    await this.$nextTick(); // NOTE: wait for window.path_prefix to be set
    await loadResource("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.min.js");
    this.pdfDoc= await pdfjsLib.getDocument(this.pdf_path).promise;
    this.Pages = this.pdfDoc.numPages;
    this.$emit('PagesUpdated', {"pages": this.Pages});
  },
  methods: {
    getNumPages(){
        return this.Pages;
    },

    async renderPage(pageNum) {
        this.pdfDoc.getPage(pageNum).then((page) => {
            // Create a canvas element for rendering each PDF page
            let canvas = document.createElement('canvas');
            const second_canvas = document.createElement('canvas');
            canvas.classList.add('pdfCanvas');
            this.$el.appendChild(canvas);
            let context = canvas.getContext('2d');
            const second_context = second_canvas.getContext('2d');
            const scale = 0.75;
            // Set the canvas size to match the PDF page size
            const viewport = page.getViewport({ scale });
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            second_canvas.width = viewport.width;
            second_canvas.height = viewport.height;
            page.render({ canvasContext: context, viewport });
            page.render({ canvasContext: second_context, viewport });

        });
    }
  },
};