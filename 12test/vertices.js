import { svgPathProperties } from "./node_modules/svg-path-properties/dist/svg-path-properties.esm.js";





document.getElementById("fileInput").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(reader.result, "image/svg+xml");

      const paths = svgDoc.querySelectorAll("path");

      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      circle.setAttributeNS("id","selectedPoint")
      circle.setAttributeNS("r","5");    
      circle.setAttributeNS("cx",0);
      circle.setAttributeNS("cy",0);
      circle.setAttributeNS("fill", "none")
      

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
        vertices = samplePathVertices(d, verticesSamplingNum); // 采样 20 个点
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
        
        //shape defined




      console.log("Shapes:", shapes);
      console.log("SensorAreas:", sensorAreas);

      userFlowState = UserFlowState.WAITING_FOR_LINE_A_POINT_A;
      instruction.innerHTML = "Please select the starting point of the entry scan line on the contour";
      
      })
      reader.readAsText(file);
    };
}});

//mouse moved handler

function distanceToSegment(px, py, x1, y1, x2, y2) {
  // Vector AB
  const dx1 = x2 - x1;
  const dy1 = y2 - y1;

  // Vector AP
  const dx2 = px - x1;
  const dy2 = py - y1;

  // Dot products
  const dotProduct = dx2 * dx1 + dy2 * dy1;
  const lengthSquared = dx1 * dx1 + dy1 * dy1;

  // Projection scalar t
  const t = dotProduct / lengthSquared;

  let closestX, closestY;

  // Closest point on the segment
  if (t < 0) {
      closestX = x1;
      closestY = y1;
  } else if (t > 1) {
      closestX = x2;
      closestY = y2;
  } else {
      closestX = x1 + t * dx1;
      closestY = y1 + t * dy1;
  }

  // Compute the distance from the point to the closest point on the segment
  const distX = px - closestX;
  const distY = py - closestY;

  return Math.sqrt(distX * distX + distY * distY);
}

function closestPointOnSegment(px, py, x1, y1, x2, y2) {
  // Vector AB
  const dx1 = x2 - x1;
  const dy1 = y2 - y1;

  // Vector AP
  const dx2 = px - x1;
  const dy2 = py - y1;

  // Dot products
  const dotProduct = dx2 * dx1 + dy2 * dy1;
  const lengthSquared = dx1 * dx1 + dy1 * dy1;

  // Projection scalar t
  const t = dotProduct / lengthSquared;

  let closestX, closestY;

  // Closest point on the segment
  if (t < 0) {
      closestX = x1;
      closestY = y1;
  } else if (t > 1) {
      closestX = x2;
      closestY = y2;
  } else {
      closestX = x1 + t * dx1;
      closestY = y1 + t * dy1;
  }

  return [closestX,closestY];
}


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
