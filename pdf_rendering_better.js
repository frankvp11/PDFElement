import {loadResource } from "/static/resources.js";

export default {
  template: "<div></div>",
  props:
    {
        pdf_path: String,
        numPages : Number,
        allPoints: Object,
    },
    

  async mounted() {

    await this.$nextTick(); // NOTE: wait for window.path_prefix to be set
    await loadResource("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.min.js");
    this.pdfDoc= await pdfjsLib.getDocument(this.pdf_path).promise;
    this.Pages = this.pdfDoc.numPages;
    
    this.$emit('PagesUpdated', {"pages": this.Pages});
    for (let i = 1; i <= this.Pages; i++) {
        this.renderPage(i);
    }
  },
  methods: {
    getNumPages(){
        return this.Pages;
    },
    return_all_points(all_points, pagenumber){
        this.$emit('all_points', {"all_points": all_points, "pagenumber": pagenumber-1});
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

            let isDragging = false;
            let draggedPointIndex = -1;
            this.userPlacedPoints = [];
            let self = this;

            function drawRectangle() {
              context.clearRect(0, 0, canvas.width, canvas.height);
              context.drawImage(second_canvas, 0, 0);
              
              if (self.userPlacedPoints.length === 2 || self.userPlacedPoints.length === 4) {
                  const topLeft = self.userPlacedPoints[0];
                  const bottomRight = self.userPlacedPoints[1];
                  
                  context.beginPath();
                  context.rect(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y);
                  context.fillStyle = 'rgba(200, 200, 200, 0)';
                  context.strokeStyle = 'red';
                  context.lineWidth = 2;
                  context.stroke();

                  if (self.userPlacedPoints.length === 2) {
                    self.userPlacedPoints.push({ x: bottomRight.x, y: topLeft.y });
                    self.userPlacedPoints.push({ x: topLeft.x, y: bottomRight.y });

                  }
                  if (self.userPlacedPoints.length === 4) {
                      const topRight = self.userPlacedPoints[2];
                      const bottomLeft = self.userPlacedPoints[3];          
                      context.fillStyle = 'rgba(0, 0, 0, 0.75)';
                      context.fillRect(0, 0, topLeft.x, canvas.height);
                      context.fillRect(topLeft.x, 0, canvas.width, topRight.y);
                      context.fillRect(bottomLeft.x, bottomLeft.y, canvas.width, canvas.height);
                      context.fillRect(topRight.x, topRight.y, bottomRight.x, bottomLeft.y-topRight.y);
                  }



              }
              self.return_all_points(self.userPlacedPoints, pageNum);
              draw_dots();
          }
            function draw_dots(){

              for (let i = 0; i < self.userPlacedPoints.length; i++) {
                  const point = self.userPlacedPoints[i];
                  context.beginPath();
                  context.arc(point.x, point.y, 5, 0, 2 * Math.PI);
                  context.fillStyle = 'red';
                  context.fill();
              }
            }

			function updateRectangleOnDrag(draggedPointIndex, mouseX, mouseY) {
				const oppositeIndex = (draggedPointIndex + 2) % 4;
				const adjacentIndex = (draggedPointIndex + 1) % 4;
		  
				self.userPlacedPoints[draggedPointIndex].x = mouseX;
				self.userPlacedPoints[draggedPointIndex].y = mouseY;
		  
				self.userPlacedPoints[oppositeIndex].y = mouseY;
		  
				const topLeft = self.userPlacedPoints[adjacentIndex];
				const bottomRight = self.userPlacedPoints[oppositeIndex];
		  
				self.userPlacedPoints[adjacentIndex].x = mouseX;
				self.userPlacedPoints[adjacentIndex].y = topLeft.y;
        self.return_all_points(self.userPlacedPoints, pageNum);
			}

            function findClosestPoint(x, y, pointList, threshold) {
                let closestIndex = -1;
                let minDistance = Infinity;

                for (let i = 0; i < pointList.length; i++) {
                    const point = pointList[i];
                    const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);

                    if (distance < threshold) {
                        closestIndex = i;
                        minDistance = distance;
                    }
                }

                return closestIndex;
            }
            canvas.addEventListener('mousemove', (event) => {
              if (isDragging) {
                  const rect = canvas.getBoundingClientRect();
                  const mouseX = event.clientX - rect.left;
                  const mouseY = event.clientY - rect.top;

                  self.userPlacedPoints[draggedPointIndex] = { x: mouseX, y: mouseY };
                  updateRectangleOnDrag(draggedPointIndex, mouseX, mouseY);
                  drawRectangle();
              }
            });
            canvas.addEventListener('mouseup', () => {
              isDragging = false;
              draggedPointIndex = -1;
              drawRectangle();
            
            });

            canvas.addEventListener('mousedown', (event) => {
              // self.mostPreviousPageNumber = pageNum; // update the most previous page number
              console.log("Clicked!", self.mostPreviousPageNumber)


              const rect = canvas.getBoundingClientRect();
              const mouseX = event.clientX - rect.left;
              const mouseY = event.clientY - rect.top;
              const closestIndex = findClosestPoint(mouseX, mouseY, self.userPlacedPoints, 10);

              if (closestIndex !== -1) {
                  isDragging = true;
                  draggedPointIndex = closestIndex;
              } else if (self.userPlacedPoints.length < 2) {
                  const point = { x: mouseX, y: mouseY };
                  self.userPlacedPoints.push(point);
              } else if (self.userPlacedPoints.length === 2 || self.userPlacedPoints.length === 4) {
                self.userPlacedPoints = [];
                  draggedPointIndex = -1;


                  
              }
              self.return_all_points(self.userPlacedPoints, pageNum);
              drawRectangle();
          });
        
        });
    },


  },
};
