import { svgPathProperties } from "./node_modules/svg-path-properties/dist/svg-path-properties.esm.js";



svgOutput = document.getElementById("output");

// 监听文件上传
document.getElementById("fileInput").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(reader.result, "image/svg+xml");

      const paths = svgDoc.querySelectorAll("path");

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
        shape.drawPath(svgOutput);
      });

      console.log("Shapes:", shapes);
    };
    reader.readAsText(file);
  }
});

// 添加点击事件监听器，用于切换选中状态
document.getElementById("output").addEventListener("click", (event) => {
  const clickedPath = event.target;

  if (clickedPath.tagName === "path") {
    const isSelected = clickedPath.getAttribute("selected") === "true";

    // 切换 selected 属性
    clickedPath.setAttribute("selected", isSelected ? "false" : "true");

    // 更改视觉效果：选中时描边为红色，未选中时为黑色
    clickedPath.style.stroke = isSelected ? "black" : "red";

    console.log(
      `Path with ID: ${clickedPath.getAttribute("id")} selected: ${!isSelected}`
    );
  }
});

// 添加 convert 按钮的事件监听器
document.getElementById("convertToSensor").addEventListener("click", () => {
  // 获取所有被选中的路径
  const selectedPaths = document.querySelectorAll("path[selected='true']");

  selectedPaths.forEach((clickedPath) => {
    const id = clickedPath.getAttribute("id");
    const d = clickedPath.getAttribute("d");
    const fill = clickedPath.getAttribute("fill") || "none";
    const stroke = clickedPath.getAttribute("stroke") || "black";
    const strokeWidth =
      parseFloat(clickedPath.getAttribute("stroke-width")) || 1;

    // 删除原始图形
    clickedPath.remove();

    // 生成顶点并创建 SensorArea 实例
    vertices = samplePathVertices(d, 20); // 采样 20 个点
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

    console.log(`Converted Shape to SensorArea with ID: ${id}`);
    sensorArea.drawPolygon(svgOutput);
  });
});



document.getElementById("placeScanGuides").addEventListener("click", () => {

  userFlowState = UserFlowState.WAITING_FOR_LINE_A_POINT_A;
  document.getElementById("instruction").innerHTML = "Please select the starting point of the entry scan line on the contour";

  //enter line guidance modes
  document.getElementById("output").addEventListener("mousemove", mouseMoved);
  //svgOutput.addEventListener("mousemove", mouseMoved());
  document.getElementById("output").addEventListener("click", mouseClicked);
  //svgOutput.addEventListener("click", mouseClicked());

  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  circle.setAttribute("id","selectedPoint")
  circle.setAttribute("r","5");    
  circle.setAttribute("cx","0");
  circle.setAttribute("cy","0");
  circle.setAttribute("fill", "none");
  svgOutput.appendChild(circle);

  console.log("entering scan guide placing mode");


});

// 监听 generate 按钮生成网格
document.getElementById("generate").addEventListener("click", () => {
  // 获取用户输入的 xnum 和 ynum
  const samplingDistanceInput = document.getElementById("samplingDistance").value; // 假设有 id="xnum" 的 input
  const numOfLinesInput = document.getElementById("numOfLines").value; // 假设有 id="ynum" 的 input

  // 转换为整数
  samplingDistance = parseInt(samplingDistanceInput, 10) || 20; // 如果输入无效，默认值为 20
  numOfLines = parseInt(numOfLinesInput, 10) || 20; // 如果输入无效，默认值为 20

  execute();
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

document.getElementById("download").addEventListener("click", () => {
  // 获取画布上的所有 SVG 内容
  if (!svgOutput) {
    console.error("SVG output element not found.");
    return;
  }

  // 创建一个克隆，以确保导出内容一致
  const svgClone = svgOutput.cloneNode(true);

  // 添加命名空间（部分浏览器需要此步骤）
  svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  // 获取 SVG 的外部 HTML
  const svgContent = svgClone.outerHTML;

  // 创建 Blob 对象
  const blob = new Blob([svgContent], { type: "image/svg+xml" });

  // 创建下载链接
  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = "canvas_output.svg"; // 下载文件名
  downloadLink.click();

  console.log("SVG exported and downloaded.");
});
