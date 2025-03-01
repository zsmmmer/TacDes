import { svgPathProperties } from "./node_modules/svg-path-properties/dist/svg-path-properties.esm.js";
const svgOutput = document.getElementById("output");

// 监听文件上传
document.getElementById("fileInput").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(reader.result, "image/svg+xml");

      const svg = svgDoc.querySelector("svg"); // 获取 SVG 根元素

      if (!svg) {
        console.error("No SVG found in the uploaded file.");
        return;
      }

      const nonPathElements = svgDoc.querySelectorAll(
        "rect, circle, ellipse, polygon, polyline, line"
      );

      nonPathElements.forEach((element) => {
        const pathData = convertToPath(element);
        if (pathData) {
          const path = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
          );
          path.setAttribute("d", pathData);
          path.setAttribute("fill", element.getAttribute("fill") || "none");
          path.setAttribute(
            "stroke",
            element.getAttribute("stroke") || "black"
          );
          path.setAttribute(
            "stroke-width",
            element.getAttribute("stroke-width") || 1
          );

          element.replaceWith(path); // 替换原始元素为路径
        }
      });

      const paths = svgDoc.querySelectorAll("path");

      paths.forEach((path) => {
        const id = `shape-${shapes.length}`; // **修改：ID 基于 shapes 数组的当前长度动态生成**
        const d = path.getAttribute("d");
        const fill = path.getAttribute("fill") || "none";
        const stroke = path.getAttribute("stroke") || "black";
        const strokeWidth = parseFloat(path.getAttribute("stroke-width")) || 1;

        console.log(`Processing path ID: ${id}, d: ${d}`);

        // 创建 Shape 实例并存储到全局数组
        const shape = new Shape(id, d, fill, stroke, strokeWidth);
        shapes.push(shape); // **修改：动态更新 shapes 数组**
        shape.drawPath(svgOutput);
        renderList();
      });

      console.log("Shapes:", shapes);
    };
    reader.readAsText(file);
  }
});

// 添加点击事件监听器，用于切换选中状态
svgOutput.addEventListener("click", (event) => {
  const clickedElement = event.target;

  // 检查是否点击了 path 或 polygon
  if (clickedElement.tagName === "path") {
    // 如果当前已经有选中的 polygon，则阻止选中 path
    const hasSelectedPolygon = document.querySelector(
      "polygon[selected='true']"
    );
    if (hasSelectedPolygon) {
      console.warn("Cannot select path while polygon is selected.");
      return; // **新增：阻止同时选中两种类型**
    }

    const isCtrlOrShiftPressed = event.ctrlKey || event.shiftKey;

    // 切换当前 path 的选中状态
    const isSelected = clickedElement.getAttribute("selected") === "true";
    clickedElement.setAttribute("selected", isSelected ? "false" : "true");
    clickedElement.style.stroke = isSelected ? "black" : "red";

    // 如果没有按下 Ctrl 或 Shift，取消其他选中 path 的状态
    if (!isCtrlOrShiftPressed) {
      document.querySelectorAll("path[selected='true']").forEach((el) => {
        if (el !== clickedElement) {
          el.setAttribute("selected", "false");
          el.style.stroke = "black";
        }
      });
    }

    console.log(
      `Path with ID: ${clickedElement.getAttribute(
        "id"
      )} selected: ${!isSelected}`
    );
  } else if (clickedElement.tagName === "polygon") {
    // 如果当前已经有选中的 path，则阻止选中 polygon
    const hasSelectedPath = document.querySelector("path[selected='true']");
    if (hasSelectedPath) {
      console.warn("Cannot select polygon while path is selected.");
      return; // **新增：阻止同时选中两种类型**
    }

    const isCtrlOrShiftPressed = event.ctrlKey || event.shiftKey;

    // 切换当前 polygon 的选中状态
    const isSelected = clickedElement.getAttribute("selected") === "true";
    clickedElement.setAttribute("selected", isSelected ? "false" : "true");
    clickedElement.style.stroke = isSelected ? "black" : "red";

    // 如果没有按下 Ctrl 或 Shift，取消其他选中 polygon 的状态
    if (!isCtrlOrShiftPressed) {
      document.querySelectorAll("polygon[selected='true']").forEach((el) => {
        if (el !== clickedElement) {
          el.setAttribute("selected", "false");
          el.style.stroke = "black";
        }
      });
    }

    console.log(
      `Polygon with ID: ${clickedElement.getAttribute(
        "id"
      )} selected: ${!isSelected}`
    );
  } else {
    // 点击空白处，取消所有选中状态
    document.querySelectorAll("[selected='true']").forEach((el) => {
      el.setAttribute("selected", "false");
      el.style.stroke = "black";
    });
    console.log("Deselected all elements.");
  }
});

// 添加 convert 按钮的事件监听器
document.getElementById("convertToSensor").addEventListener("click", () => {
  // 获取所有被选中的路径
  const selectedPaths = document.querySelectorAll("path[selected='true']");

  selectedPaths.forEach((clickedPath) => {
    const id = `sensorArea-${sensorAreas.length}`; // **修改：动态生成 ID，使用 sensorAreas 数组的长度**
    const d = clickedPath.getAttribute("d");
    const fill = clickedPath.getAttribute("fill") || "none";
    const stroke = clickedPath.getAttribute("stroke") || "black";
    const strokeWidth =
      parseFloat(clickedPath.getAttribute("stroke-width")) || 1;

    // 删除原始图形
    clickedPath.remove();

    // 在 shapes 数组中查找并删除对应的 Shape 实例
    const shapeIndex = shapes.findIndex((shape) => shape.id === id); // **新增：查找 shape 的索引**
    if (shapeIndex !== -1) {
      shapes.splice(shapeIndex, 1); // **新增：删除对应的 Shape 实例**
      console.log(`Shape with ID: ${id} removed from shapes array.`);
    } else {
      console.warn(`Shape with ID: ${id} not found in shapes array.`);
    }

    // 生成顶点并创建 SensorArea 实例
    const vertices = samplePathVertices(d, 20); // 采样 20 个点
    const sensorArea = new SensorArea(
      id, // **使用新的 ID 格式**
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
    renderList();
  });
});

//convert to connector功能

document.getElementById("convertToConnector").addEventListener("click", () => {
  const svgOutput = document.getElementById("output");

  // 获取所有被选中的路径
  const selectedPaths = document.querySelectorAll("path[selected='true']");

  if (selectedPaths.length === 0) {
    console.warn("No selected Shapes to convert.");
    return;
  }

  selectedPaths.forEach((pathElement) => {
    const id = pathElement.getAttribute("id");
    const d = pathElement.getAttribute("d");
    const stroke = pathElement.getAttribute("stroke") || "black";
    const strokeWidth =
      parseFloat(pathElement.getAttribute("stroke-width")) || 1;

    // 验证是否为 Shape 类型并且是直线
    const shapeIndex = shapes.findIndex((shape) => shape.id === id);
    if (shapeIndex === -1) {
      console.warn(`Shape with ID: ${id} not found in shapes array.`);
      return;
    }

    const shape = shapes[shapeIndex];

    // 检查是否为直线
    if (!isStraightLine(d)) {
      console.warn(
        `Shape with ID: ${id} is not a straight line and cannot be converted.`
      );
      return;
    }

    // 从路径中提取起点和终点
    const pathProperties = new svgPathProperties(d);
    const start = pathProperties.getPointAtLength(0); // 起点
    const end = pathProperties.getPointAtLength(
      pathProperties.getTotalLength()
    ); // 终点

    // 删除页面上的原始 Shape
    pathElement.remove();

    // 从 shapes 数组中移除
    shapes.splice(shapeIndex, 1);
    console.log(`Shape with ID: ${id} removed from shapes array.`);

    // 创建 Connector 并绘制
    const connector = new Connector(
      `connector-${connectors.length}`,
      [start.x, start.y],
      [end.x, end.y],
      "uniform", // 默认连接类型为 "uniform"
      5 // 默认分割点数为 5
    );
    connector.stroke = "pink";
    connector.strokeWidth = strokeWidth;
    connector.drawPath(svgOutput);

    // 将新的 Connector 添加到全局 connectors 数组
    connectors.push(connector);
    renderList();
    console.log(`Shape with ID: ${id} converted to Connector.`);
  });

  console.log("Connectors after conversion:", connectors);
});

// 监听 generate 按钮生成网格
document.getElementById("generate").addEventListener("click", () => {
  // 获取用户输入的 xnum 和 ynum
  const xnumInput = document.getElementById("xnum").value; // 假设有 id="xnum" 的 input
  const ynumInput = document.getElementById("ynum").value; // 假设有 id="ynum" 的 input

  // 转换为整数
  const xnum = parseInt(xnumInput, 10) || 20; // 如果输入无效，默认值为 20
  const ynum = parseInt(ynumInput, 10) || 20; // 如果输入无效，默认值为 20

  // 获取所有被选中的 polygon
  const selectedPolygons = document.querySelectorAll(
    "polygon[selected='true']"
  );
  const selectedIds = Array.from(selectedPolygons).map((polygon) =>
    polygon.getAttribute("id")
  );

  // 针对选中的 SensorArea 实例生成网格
  sensorAreas.forEach((sensorArea) => {
    if (selectedIds.includes(sensorArea.id)) {
      sensorArea.drawBoundingGrid(svgOutput, xnum, ynum); // 替换为实际的 xnum 和 ynum
    }
  });

  console.log(
    `Generated bounding grids for selected SensorAreas: ${selectedIds.join(
      ", "
    )}`
  );
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

//path预处理
function convertToPath(element) {
  const tagName = element.tagName.toLowerCase();
  switch (tagName) {
    case "rect": {
      const x = parseFloat(element.getAttribute("x")) || 0;
      const y = parseFloat(element.getAttribute("y")) || 0;
      const width = parseFloat(element.getAttribute("width")) || 0;
      const height = parseFloat(element.getAttribute("height")) || 0;
      return `M ${x},${y} H ${x + width} V ${y + height} H ${x} Z`;
    }
    case "circle": {
      const cx = parseFloat(element.getAttribute("cx")) || 0;
      const cy = parseFloat(element.getAttribute("cy")) || 0;
      const r = parseFloat(element.getAttribute("r")) || 0;
      return `M ${cx - r},${cy} A ${r},${r} 0 1,0 ${
        cx + r
      },${cy} A ${r},${r} 0 1,0 ${cx - r},${cy}`;
    }
    case "ellipse": {
      const cx = parseFloat(element.getAttribute("cx")) || 0;
      const cy = parseFloat(element.getAttribute("cy")) || 0;
      const rx = parseFloat(element.getAttribute("rx")) || 0;
      const ry = parseFloat(element.getAttribute("ry")) || 0;
      return `M ${cx - rx},${cy} A ${rx},${ry} 0 1,0 ${
        cx + rx
      },${cy} A ${rx},${ry} 0 1,0 ${cx - rx},${cy}`;
    }
    case "line": {
      const x1 = parseFloat(element.getAttribute("x1")) || 0;
      const y1 = parseFloat(element.getAttribute("y1")) || 0;
      const x2 = parseFloat(element.getAttribute("x2")) || 0;
      const y2 = parseFloat(element.getAttribute("y2")) || 0;
      return `M ${x1},${y1} L ${x2},${y2}`;
    }
    case "polygon":
    case "polyline": {
      const points = element.getAttribute("points") || "";
      const isClosed = tagName === "polygon";
      return `M ${points} ${isClosed ? "Z" : ""}`;
    }
    default:
      console.warn(`Unsupported SVG element: ${tagName}`);
      return "";
  }
}

// download分层导出
document.getElementById("download").addEventListener("click", () => {
  const svgOutput = document.getElementById("output");

  if (!svgOutput) {
    console.error("SVG output element not found.");
    return;
  }

  // 获取用户输入的标题
  const titleInput = document.querySelector(".midtxt-input");
  let titleName = titleInput?.value?.trim() || "tactile_sensor";

  // 如果标题为默认值，替换为 "tactile_sensor"
  if (titleName === "Add Title Here") {
    titleName = "tactile_sensor";
  }

  // 获取当前时间并格式化
  const getFormattedTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
  };

  // 导出单个层的函数
  const exportLayer = (layerId) => {
    const svgClone = svgOutput.cloneNode(true); // 克隆整个 SVG
    const layer = svgClone.querySelector(`#${layerId}`);

    if (!layer) {
      console.error(`Layer ${layerId} not found.`);
      return;
    }

    // 隔离目标图层
    svgClone.querySelectorAll("g").forEach((g) => {
      if (g.id !== layerId) {
        g.remove();
      }
    });

    svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg"); // 添加命名空间
    const svgContent = svgClone.outerHTML;

    // 生成文件名
    const timestamp = getFormattedTime();
    const fileName = `${titleName}-${layerId}-${timestamp}.svg`;

    // 创建并触发下载
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = fileName;
    downloadLink.click();
  };

  // 导出合并图层的函数
  const exportCombined = () => {
    const svgClone = svgOutput.cloneNode(true); // 克隆整个 SVG
    svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg"); // 添加命名空间
    const svgContent = svgClone.outerHTML;

    // 生成文件名
    const timestamp = getFormattedTime();
    const fileName = `${titleName}-combined-${timestamp}.svg`;

    // 创建并触发下载
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = fileName;
    downloadLink.click();
  };

  // 导出所有单独图层
  ["shape-layer", "sensor-layer", "connector-layer"].forEach(exportLayer);

  // 导出合并图层
  exportCombined();
});
function isStraightLine(d) {
  // 正则匹配直线路径的形式，例如 "M x1,y1 L x2,y2"
  const straightLineRegex = /^M\s*[\d.-]+,[\d.-]+\s*L\s*[\d.-]+,[\d.-]+$/i;
  return straightLineRegex.test(d);
}

/***************连接功能实现****************/
let selectedGroups = []; // 保存选中的交点组索引

// 点击 Connect 按钮后显示交点组中心圆形
document.getElementById("connectButton").addEventListener("click", () => {
  console.log("Connect button clicked"); // **调试信息**
  console.log("Current intersection groups:", intersectionGroups); // **调试：查看交点组数据**

  // 清空选中状态
  selectedGroups = [];

  // 显示交点组中心圆形
  createConnectionCircles();
});

// 生成交点组中心圆形
const createConnectionCircles = () => {
  const svg = document.querySelector("svg");
  if (!svg) {
    console.error("SVG element not found!"); // **调试：SVG 容器未找到**
    return;
  }

  const connectorLayer = svg.querySelector("#connector-layer");
  if (!connectorLayer) {
    console.error("Connector layer not found!"); // **调试：Connector 层未找到**
    return;
  }

  // 清除已有的圆形（如果有）
  document
    .querySelectorAll(".connection-circle")
    .forEach((circle) => circle.remove());

  intersectionGroups.forEach((group, index) => {
    if (group.length === 0) {
      console.warn(`Intersection group ${index} is empty, skipping.`); // **调试：跳过空交点组**
      return;
    }

    // **修改：直接取中间点（第 n/2 或 n-1/2 点）**
    const midIndex = Math.floor(group.length / 2); // 中间索引
    const midPoint = group[midIndex];
    console.log(`Group ${index} midPoint: (${midPoint[0]}, ${midPoint[1]})`); // **调试：打印中间点**

    // 创建圆形
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("cx", midPoint[0]); // 使用中间点的 X 坐标
    circle.setAttribute("cy", midPoint[1]); // 使用中间点的 Y 坐标
    circle.setAttribute("r", 5); // 圆形半径
    circle.setAttribute("fill", "blue"); // 初始颜色
    circle.setAttribute("data-group-index", index); // 记录交点组索引
    circle.setAttribute("class", "connection-circle");

    // 添加到 connector-layer
    connectorLayer.appendChild(circle);
  });

  const connectors = document.querySelectorAll("#connector-layer line");
  connectors.forEach((connector, index) => {
    const x1 = parseFloat(connector.getAttribute("x1"));
    const y1 = parseFloat(connector.getAttribute("y1"));
    const x2 = parseFloat(connector.getAttribute("x2"));
    const y2 = parseFloat(connector.getAttribute("y2"));

    // 计算中点
    const midPoint = [(x1 + x2) / 2, (y1 + y2) / 2];
    console.log(
      `Connector ${index} midPoint: (${midPoint[0]}, ${midPoint[1]})`
    ); // **调试：打印中点**

    // 创建圆形
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("cx", midPoint[0]);
    circle.setAttribute("cy", midPoint[1]);
    circle.setAttribute("r", 5);
    circle.setAttribute("fill", "blue");
    circle.setAttribute("data-connector-index", index); // 记录 connector 索引
    circle.setAttribute("class", "connection-circle");

    // 添加到 connector-layer
    connectorLayer.appendChild(circle);
  });
};

// 圆形点击选择交点组
// 更新选择逻辑，支持新的参数格式
document.querySelector("svg").addEventListener("click", (event) => {
  if (
    event.target.tagName === "circle" &&
    event.target.classList.contains("connection-circle")
  ) {
    const circle = event.target;
    const groupIndex = parseInt(circle.getAttribute("data-group-index"), 10);
    const connectorIndex = parseInt(
      circle.getAttribute("data-connector-index"),
      10
    );

    if (
      groupIndex >= 0 &&
      !selectedGroups.some((g) => g.index === groupIndex)
    ) {
      selectedGroups.push({ type: "group", index: groupIndex });
      circle.setAttribute("fill", "red");
      console.log(`Sensor group ${groupIndex} selected.`);
    } else if (
      connectorIndex >= 0 &&
      !selectedGroups.some((g) => g.index === connectorIndex)
    ) {
      selectedGroups.push({ type: "connector", index: connectorIndex });
      circle.setAttribute("fill", "red");
      console.log(`Connector ${connectorIndex} selected.`);
    }

    if (selectedGroups.length === 2) {
      console.log("Two selections made:", selectedGroups);

      // 调用连接函数
      connectSelectedGroups(selectedGroups[0], selectedGroups[1]);

      // 清除圆形并重置状态
      document
        .querySelectorAll(".connection-circle")
        .forEach((circle) => circle.remove());
      selectedGroups = [];
    }
  }
});
/**
 * 根据 sensor area 的交点组数量，在 connector 上生成均匀分布的交点组
 * @param {number} connectorIndex - Connector 的索引
 * @param {number} groupIndex - Sensor area 的索引，用于参考交点数量
 * @returns {Array} 生成的 connector 上的交点组
 */
function generateConnectorPoints(connectorIndex, groupIndex) {
  const connector = document.querySelectorAll("#connector-layer line")[
    connectorIndex
  ];
  const sensorGroup = intersectionGroups[groupIndex];

  if (!connector || !sensorGroup) {
    console.error("Invalid connector or sensor group.");
    return [];
  }

  // 获取 connector 的起点和终点
  const x1 = parseFloat(connector.getAttribute("x1"));
  const y1 = parseFloat(connector.getAttribute("y1"));
  const x2 = parseFloat(connector.getAttribute("x2"));
  const y2 = parseFloat(connector.getAttribute("y2"));

  // 获取 sensor group 的交点数量
  const numPoints = sensorGroup.length;

  // 在 connector 上生成均匀分布的交点
  const points = [];
  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1); // 参数化插值
    const x = x1 + t * (x2 - x1);
    const y = y1 + t * (y2 - y1);
    points.push([x, y]);
  }

  console.log(
    `Generated ${points.length} points on connector ${connectorIndex}`
  );
  return points;
}
// **动态规划：找到最优连接方案**
function findOptimalConnections(groupA, groupB) {
  const n = groupA.length;
  const m = groupB.length;

  // 正序和反序连接
  const forwardConnections = groupA.map((pointA, i) => [pointA, groupB[i % m]]);
  const reverseConnections = groupA.map((pointA, i) => [
    pointA,
    groupB[m - 1 - (i % m)],
  ]);

  // 根据交点数目选择最佳方案
  const forwardIntersections = countIntersections(forwardConnections);
  const reverseIntersections = countIntersections(reverseConnections);

  return forwardIntersections < reverseIntersections
    ? forwardConnections
    : reverseConnections;
}

// **计算交点数目**
function countIntersections(connections) {
  let count = 0;
  connections.forEach(([start1, end1], i) => {
    for (let j = i + 1; j < connections.length; j++) {
      const [start2, end2] = connections[j];
      if (linesIntersect(start1, end1, start2, end2)) {
        count++;
      }
    }
  });
  return count;
}

// **绘制路径为 polyline**
function drawPolyline(path) {
  const sensorLayer = svgOutput.querySelector("#connector-layer");
  const polyline = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "polyline"
  );

  polyline.setAttribute("points", path.map(([x, y]) => `${x},${y}`).join(" "));
  polyline.setAttribute("stroke", "#5752FF");
  polyline.setAttribute("stroke-width", 1);
  polyline.setAttribute("fill", "none");
  polyline.setAttribute("id", "connectLine");

  sensorLayer.appendChild(polyline);
}

function getObstacles() {
  const obstacles = { lines: [] };

  const gridLines = document.querySelectorAll("#gridLine");
  gridLines.forEach((line) => {
    const x1 = parseFloat(line.getAttribute("x1"));
    const y1 = parseFloat(line.getAttribute("y1"));
    const x2 = parseFloat(line.getAttribute("x2"));
    const y2 = parseFloat(line.getAttribute("y2"));
    obstacles.lines.push([
      [x1, y1],
      [x2, y2],
    ]);
  });

  const connectorLines = document.querySelectorAll("#connector-layer polyline");
  connectorLines.forEach((polyline) => {
    const points = polyline
      .getAttribute("points")
      .trim()
      .split(" ")
      .map((point) => point.split(",").map(parseFloat));
    for (let i = 0; i < points.length - 1; i++) {
      obstacles.lines.push([points[i], points[i + 1]]);
    }
  });

  return obstacles;
}

/**
 * 连接两个交点组
 * @param {Object} groupA - 第一个交点组，格式为 { type: "group"|"connector", index: 索引 }
 * @param {Object} groupB - 第二个交点组，格式为 { type: "group"|"connector", index: 索引 }
 */
function connectSelectedGroups(groupA, groupB) {
  let groupAPoints, groupBPoints;

  // 根据类型提取交点组
  if (groupA.type === "group") {
    groupAPoints = intersectionGroups[groupA.index];
  } else if (groupA.type === "connector") {
    groupAPoints = generateConnectorPoints(groupA.index, groupB.index);
  }

  if (groupB.type === "group") {
    groupBPoints = intersectionGroups[groupB.index];
  } else if (groupB.type === "connector") {
    groupBPoints = generateConnectorPoints(groupB.index, groupA.index);
  }

  if (
    !groupAPoints ||
    !groupBPoints ||
    groupAPoints.length === 0 ||
    groupBPoints.length === 0
  ) {
    console.error("One or both groups are empty. Cannot connect.");
    return;
  }

  // 动态规划选择连接方案
  const connections = findOptimalConnections(groupAPoints, groupBPoints);

  connections.forEach(([start, end]) => {
    // // 使用 Potential Field Method 生成路径
    // const obstacles = getObstacles(); // 获取障碍物
    // const path = generatePathWithPotentialField(start, end, obstacles);
    const path = [start, end];

    if (path.length > 0) {
      drawPolyline(path); // 将生成的路径绘制为折线
    } else {
      console.warn("Failed to generate a path between points.");
    }
  });

  console.log("Connected the provided groups with Potential Field Method.");
}

let isDragging = false;
let draggedElement = null;
let startMousePosition = { x: 0, y: 0 };
let initialElementPosition = { x: 0, y: 0 };

// 添加鼠标按下事件监听器，开始拖拽
svgOutput.addEventListener("mousedown", (event) => {
  const target = event.target;

  // 只允许拖拽选中的 path 或 polygon
  if (
    (target.tagName === "path" || target.tagName === "polygon") &&
    target.getAttribute("selected") === "true"
  ) {
    isDragging = true;
    draggedElement = target;

    // 记录鼠标按下时的位置
    startMousePosition = { x: event.clientX, y: event.clientY };

    // 获取形状的初始位置
    if (draggedElement.tagName === "path") {
      const transform =
        draggedElement.getAttribute("transform") || "translate(0, 0)";
      const matches = transform.match(/translate\(([-\d.]+),\s*([-\d.]+)\)/);
      initialElementPosition = matches
        ? { x: parseFloat(matches[1]), y: parseFloat(matches[2]) }
        : { x: 0, y: 0 };
    } else if (draggedElement.tagName === "polygon") {
      initialElementPosition = { x: 0, y: 0 }; // 初始多边形没有 transform
    }

    console.log(`Started dragging element with ID: ${draggedElement.id}`);
  }
});

// 添加鼠标移动事件监听器，更新拖拽位置
document.addEventListener("mousemove", (event) => {
  if (isDragging && draggedElement) {
    // 计算鼠标移动的偏移量
    const dx = event.clientX - startMousePosition.x;
    const dy = event.clientY - startMousePosition.y;

    // 更新形状的位置
    if (draggedElement.tagName === "path") {
      // 更新路径的 transform 属性
      const newX = initialElementPosition.x + dx;
      const newY = initialElementPosition.y + dy;
      draggedElement.setAttribute("transform", `translate(${newX}, ${newY})`);
    } else if (draggedElement.tagName === "polygon") {
      // 更新多边形的点坐标
      const points = draggedElement.getAttribute("points").split(" ");
      const updatedPoints = points
        .map((point) => {
          const [x, y] = point.split(",").map(parseFloat);
          return `${x + dx},${y + dy}`;
        })
        .join(" ");
      draggedElement.setAttribute("points", updatedPoints);
    }

    console.log(
      `Dragging element with ID: ${draggedElement.id} to new position (${dx}, ${dy})`
    );
  }
});

// 添加鼠标释放事件监听器，结束拖拽
document.addEventListener("mouseup", () => {
  if (isDragging) {
    console.log(`Finished dragging element with ID: ${draggedElement?.id}`);
    isDragging = false;
    draggedElement = null;
  }
});

// 获取 list 容器
const listContainer = document.getElementById("list-container");

// 渲染列表
function renderList() {
  // 清空列表
  listContainer.innerHTML = "";

  // 渲染 Shape 实例
  shapes.forEach((shape, index) => {
    addItemToList(
      `Shape ${index + 1}`,
      "./assets/toolbar/shape2.png",
      ["dot", "eye", "circle", "zhankai"],
      `Shape ID: ${shape.id}`
    );
  });

  // 渲染 SensorArea 实例
  sensorAreas.forEach((sensorArea, index) => {
    addItemToList(
      `Sensor Area ${index + 1}`,
      "./assets/toolbar/sensor.png",
      ["dot", "eye", "circle", "shouqi"],
      `Sensor Area ID: ${sensorArea.id}`
    );
  });

  // 渲染 Connector 实例
  connectors.forEach((connector, index) => {
    addItemToList(
      `Connector x${connector.points}`,
      "./assets/toolbar/connector.png",
      ["dot", "eye", "circle", "zhankai"],
      `Connector ID: ${connector.id}`
    );
  });
}

// 添加 item 到列表
function addItemToList(name, imgSrc, iconKeys, description) {
  // 创建 item 容器
  const itemDiv = document.createElement("div");
  itemDiv.className = "item";

  // 创建 name 部分
  const nameDiv = document.createElement("div");
  nameDiv.className = "name";

  const numberSpan = document.createElement("span");
  numberSpan.className = "number";
  numberSpan.textContent = name;

  const imgElement = document.createElement("img");
  imgElement.className = "img";
  imgElement.src = imgSrc;

  const buttonTxt = document.createElement("button");
  buttonTxt.className = "txt";
  buttonTxt.textContent = description;

  // 组合 name 部分
  nameDiv.appendChild(numberSpan);
  nameDiv.appendChild(imgElement);
  nameDiv.appendChild(buttonTxt);

  // 创建 stage 部分
  const stageDiv = document.createElement("div");
  stageDiv.className = "stage";

  iconKeys.forEach((iconKey) => {
    const button = document.createElement("button");
    button.className = "choices";

    const img = document.createElement("img");
    img.src = `./assets/rightpanel/${iconKey}.png`;
    img.className = "choices";

    button.appendChild(img);
    stageDiv.appendChild(button);

    // 添加事件
    button.addEventListener("click", () => {
      console.log(`${name} - ${iconKey} clicked`);
    });
  });

  // 组合所有部分到 item
  itemDiv.appendChild(nameDiv);
  itemDiv.appendChild(stageDiv);

  // 添加到 list 容器
  listContainer.appendChild(itemDiv);
}
