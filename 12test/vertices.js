import { svgPathProperties } from "./node_modules/svg-path-properties/dist/svg-path-properties.esm.js";

//parameters
const verticesSamplingNum = 50;
const canvasWidth = 1600;
const canvasHeight = 1200;
const parallelScanSamplingDistance = 10;
const numOfVerticalLines = 10;
const numOfHorizontalLines = 10;

// 监听文件上传


document.getElementById("fileInput").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(reader.result, "image/svg+xml");

      const paths = svgDoc.querySelectorAll("path");
      const svgOutput = document.getElementById("output");

      paths.forEach((path, index) => {
        const id = `shape-${index}`;
        const d = path.getAttribute("d");
        const fill = path.getAttribute("fill") || "none";
        const stroke = path.getAttribute("stroke") || "black";
        const strokeWidth = parseFloat(path.getAttribute("stroke-width")) || 1;

        console.log(`Processing path ID: ${id}, d: ${d}`);

        // 创建 Shape 实例并存储到全局数组
        const shape = new Shape(id, d, fill, stroke, strokeWidth);
        shapes.push(shape);

        // 生成顶点并创建 SensorArea 实例
        const vertices = samplePathVertices(d, verticesSamplingNum); // 采样 20 个点
        const sensorArea = new SensorArea(
          id,
          d,
          fill,
          stroke,
          strokeWidth,
          vertices,
          "polygon"
        );
        sensorAreas.push(sensorArea);

        console.log(`Generated vertices for path ID ${id}:`, vertices);

        // 绘制多边形
        sensorArea.drawPolygon(svgOutput);
        
        //start line drawing from here

        //first, find one or more pairs of intersections between each y parallel and the sensor area
        let verticalLineKeyPoints = [];
        for(let y = 0; y <= canvasHeight; y+=parallelScanSamplingDistance){
          let intersections = findPolygonLineYIntersections(vertices, y);
  
          if(intersections.length%2!=0){
            console.log('Intersections are not in pairs. Might generate error.');
          }
          if(intersections.length == 0){
            continue;//no intersection. don't draw. 
          }
  
          //identify the two pairs on both edges of it
          let minX = canvasWidth;
          let maxX = 0;
      
          for (const point of intersections) {
              if (point[0] < minX) minX = point[0];
              if (point[0] > maxX) maxX = point[0];
          }
          // now minX and maxX are found
          //next, evenly divide the segment by vertical lines
          let verticalXs = [];
          let dx = (maxX-minX)/(numOfVerticalLines+1);
          for(let i = 1; i <= numOfVerticalLines; i++){
            let xi = minX + i*dx;
            verticalXs.push(xi);
          }
          verticalLineKeyPoints.push({y: y,verticalXs: verticalXs});
          
        }
  
        //formula for (n+1)th vertical curve:
        //[verticalLineKeyPoints[m].verticalXs[n], verticalLineKeyPoints[m].y], where m = [0 : verticalLineKeyPoints.length-1]
  
        for(let n=0; n<numOfVerticalLines; n++){
          let polyline = []
          for(let m=0; m<verticalLineKeyPoints.length;m++){
            polyline.push([verticalLineKeyPoints[m].verticalXs[n], verticalLineKeyPoints[m].y]);
          }

          //draw polylines
          drawPolyline(svgOutput,polyline,"none","pink",1);


        }
  




  
        //do exact same thing for x parallels
        let horizontalLineKeyPoints = [];
        for(let x = 0; x <= canvasWidth; x+=parallelScanSamplingDistance){
          let intersections = findPolygonLineXIntersections(vertices, x);
  
          if(intersections.length%2!=0){
            console.log('Intersections are not in pairs. Might generate error.');
          }
          if(intersections.length == 0){
            continue;//no intersection. don't draw. 
          }
  
          //identify the two pairs on both edges of it
          let minY = canvasHeight;
          let maxY = 0;
      
          for (const point of intersections) {
              if (point[1] < minY) minY = point[1];
              if (point[1] > maxY) maxY = point[1];
          }
          // now minY and maxY are found
          //next, evenly divide the segment by vertical lines
          let horizontalYs = [];
          let dy = (maxY-minY)/(numOfHorizontalLines+1);
          for(let i = 1; i <= numOfHorizontalLines; i++){
            let yi = minY + i*dy;
            horizontalYs.push(yi);
          }
          horizontalLineKeyPoints.push({x: x,horizontalYs: horizontalYs});
          
        }
  
        //formula for (n+1)th vertical curve:
        //[verticalLineKeyPoints[m].verticalXs[n], verticalLineKeyPoints[m].y], where m = [0 : verticalLineKeyPoints.length-1]
  
        for(let n=0; n<numOfHorizontalLines; n++){
          let polyline = []
          for(let m=0; m<horizontalLineKeyPoints.length;m++){
            polyline.push([horizontalLineKeyPoints[m].x, horizontalLineKeyPoints[m].horizontalYs[n]]);
          }

          //draw polylines
          drawPolyline(svgOutput,polyline,"none","cyan",1);
        }
      }
    
    );




      console.log("Shapes:", shapes);
      console.log("SensorAreas:", sensorAreas);
    };
    reader.readAsText(file);
  }
});

// 使用 svg-path-properties 将路径采样为顶点
function samplePathVertices(d, sampleCount = 100) {
  try {
    const properties = new svgPathProperties(d);
    const length = properties.getTotalLength(); // 获取路径总长度
    const vertices = [];

    for (let i = 0; i <= sampleCount; i++) {
      const point = properties.getPointAtLength((length * i) / sampleCount);
      vertices.push([point.x, point.y]);
    }

    return vertices;
  } catch (error) {
    console.error(`Error sampling path: ${error.message}`);
    return [];
  }
}

// 绘制多边形
function drawPolygon(svg, vertices, fill, stroke, strokeWidth) {
  const polygon = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "polygon"
  );

  // 设置顶点
  const points = vertices.map(([x, y]) => `${x},${y}`).join(" ");
  polygon.setAttribute("points", points);

  // 设置样式
  polygon.setAttribute("fill", fill);
  polygon.setAttribute("stroke", stroke);
  polygon.setAttribute("stroke-width", strokeWidth);

  // 添加到 SVG
  svg.appendChild(polygon);
}

function drawPolyline(svg, points, fill, stroke, strokeWidth) {
  const polyline = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "polyline"
  );

  // 设置顶点
  polyline.setAttribute("points", points.map(([x, y]) => `${x},${y}`).join(" "));

  // 设置样式
  polyline.setAttribute("fill", fill);
  polyline.setAttribute("stroke", stroke);
  polyline.setAttribute("stroke-width", strokeWidth);

  // 添加到 SVG
  svg.appendChild(polyline);
}


function findPolygonLineYIntersections(polygon, lineY) {//for hosrizontal line intersections
  const intersections = [];

  for (let i = 0; i < polygon.length; i++) {
      // Get the current and next vertex
      const [x1, y1] = polygon[i];
      const [x2, y2] = polygon[(i + 1) % polygon.length]; // Wrap around to the first vertex

      // Check if the line segment intersects the horizontal line
      if ((y1 <= lineY && y2 > lineY) || (y2 <= lineY && y1 > lineY)) {
          // Calculate the x-coordinate of the intersection point
          const t = (lineY - y1) / (y2 - y1); // Interpolation factor
          const x = x1 + t * (x2 - x1);

          intersections.push([x, lineY]);
      }
  }

  return intersections;
}

function findPolygonLineXIntersections(polygon, lineX) {//for vertical line intersections
  const intersections = [];

  for (let i = 0; i < polygon.length; i++) {
      // Get the current and next vertex
      const [x1, y1] = polygon[i];
      const [x2, y2] = polygon[(i + 1) % polygon.length]; // Wrap around to the first vertex

      // Check if the line segment intersects the vertical line
      if ((x1 <= lineX && x2 > lineX) || (x2 <= lineX && x1 > lineX)) {
          // Calculate the y-coordinate of the intersection point
          const t = (lineX - x1) / (x2 - x1); // Interpolation factor
          const y = y1 + t * (y2 - y1);

          intersections.push([lineX, y]);
      }
  }

  return intersections;
}
