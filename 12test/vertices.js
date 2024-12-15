import { svgPathProperties } from "./node_modules/svg-path-properties/dist/svg-path-properties.esm.js";

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
        const vertices = samplePathVertices(d, 20); // 采样 20 个点
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
      });

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
