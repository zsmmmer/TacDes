// 定义 Shape 类
class Shape {
  constructor(
    id = "",
    d = "",
    fill = "none",
    stroke = "black",
    strokeWidth = 1
  ) {
    this.id = id; // 图形 ID
    this.d = d; // 路径信息 (SVG 的 d 属性)
    this.fill = fill; // 填充颜色
    this.stroke = stroke; // 边框颜色
    this.strokeWidth = strokeWidth; // 边框宽度
  }
  drawPath(svg) {
    const shapeLayer = svg.querySelector("#shape-layer");
    if (!shapeLayer) return;

    const pathElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );

    // 设置路径属性
    pathElement.setAttribute("id", this.id);
    pathElement.setAttribute("d", this.d);
    pathElement.setAttribute("fill", this.fill);
    pathElement.setAttribute("stroke", this.stroke);
    pathElement.setAttribute("stroke-width", this.strokeWidth);

    // 添加到 shape-layer
    shapeLayer.appendChild(pathElement);
  }
}

// 定义 sensorArea 类 (继承自 Shape)
class SensorArea extends Shape {
  constructor(
    id = "",
    d = "",
    fill = "none",
    stroke = "black",
    strokeWidth = 1,
    vertices = [],
    type = "",
    wireEndpoints = []//array of pairs of endpoints for each wire
  ) {
    super(id, d, fill, stroke, strokeWidth); // 调用基类构造函数
    this.vertices = vertices; // 顶点数组
    this.type = type; // 图形类型（如 'polygon', 'curve'）
    this.wireEndpoints = wireEndpoints;
  }
  // 绘制多边形的方法
  drawPolygon(svg) {
    const sensorLayer = svg.querySelector("#sensor-layer");
    if (!sensorLayer) return;

    const polygon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polygon"
    );

    // 设置顶点
    const points = this.vertices.map(([x, y]) => `${x},${y}`).join(" ");
    polygon.setAttribute("id", this.id);
    polygon.setAttribute("points", points);

    // 设置样式
    polygon.setAttribute("fill", this.fill);
    polygon.setAttribute("stroke", this.stroke);
    polygon.setAttribute("stroke-width", this.strokeWidth);

    // 添加到 sensor-layer
    sensorLayer.appendChild(polygon);
  }

  // 生成最小包围矩形的方法
  generateBoundingBox() {
    if (this.vertices.length === 0) return null;

    // 找到顶点的边界
    const xValues = this.vertices.map(([x]) => x);
    const yValues = this.vertices.map(([_, y]) => y);

    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);

    // 返回矩形信息
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  // 绘制最小包围矩形的方法
  drawBoundingBox(svg) {
    const boundingBox = this.generateBoundingBox();
    if (!boundingBox) return;

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", boundingBox.x);
    rect.setAttribute("y", boundingBox.y);
    rect.setAttribute("width", boundingBox.width);
    rect.setAttribute("height", boundingBox.height);
    rect.setAttribute("fill", "none");
    rect.setAttribute("stroke", "red");
    rect.setAttribute("stroke-width", 1);

    // 添加到 SVG
    svg.appendChild(rect);
  }

  绘制裁剪后的网格;
  drawBoundingGrid(svg, xnum, ynum) {
    const sensorLayer = svg.querySelector("#sensor-layer");
    if (!sensorLayer) return;

    const boundingBox = this.generateBoundingBox();
    if (!boundingBox) return;

    const { x, y, width, height } = boundingBox;

    const cellWidth = width / xnum;
    const cellHeight = height / ynum;

    // 垂直线
    for (let i = 0; i <= xnum; i++) {
      const x1 = x + i * cellWidth;
      const y1 = y;
      const x2 = x + i * cellWidth;
      const y2 = y + height;

      const [start, end] = clipLineWithPolygon(x1, y1, x2, y2, this.vertices);

      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line.setAttribute("x1", start[0]);
      line.setAttribute("y1", start[1]);
      line.setAttribute("x2", end[0]);
      line.setAttribute("y2", end[1]);
      line.setAttribute("stroke", "blue");
      line.setAttribute("stroke-width", 0.5);
      sensorLayer.appendChild(line);
    }

    // 水平线
    for (let i = 0; i <= ynum; i++) {
      const x1 = x;
      const y1 = y + i * cellHeight;
      const x2 = x + width;
      const y2 = y + i * cellHeight;

      const [start, end] = clipLineWithPolygon(x1, y1, x2, y2, this.vertices);

      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line.setAttribute("x1", start[0]);
      line.setAttribute("y1", start[1]);
      line.setAttribute("x2", end[0]);
      line.setAttribute("y2", end[1]);
      line.setAttribute("stroke", "blue");
      line.setAttribute("stroke-width", 0.5);
      sensorLayer.appendChild(line);
    }
  }
}

const shapes = []; // 存储 Shape 实例
const sensorAreas = []; // 存储 SensorArea 实例

// 判断两条线段是否相交
function linesIntersect(p1, p2, q1, q2) {
  const cross = (a, b) => a[0] * b[1] - a[1] * b[0];

  const d1 = [p2[0] - p1[0], p2[1] - p1[1]];
  const d2 = [q2[0] - q1[0], q2[1] - q1[1]];
  const d3 = [q1[0] - p1[0], q1[1] - p1[1]];

  const denom = cross(d1, d2);
  if (denom === 0) return false; // 平行或重叠

  const t = cross(d3, d2) / denom;
  const u = cross(d3, d1) / denom;

  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

// 计算交点
function intersectionPoint(p1, p2, q1, q2) {
  const cross = (a, b) => a[0] * b[1] - a[1] * b[0];

  const d1 = [p2[0] - p1[0], p2[1] - p1[1]];
  const d2 = [q2[0] - q1[0], q2[1] - q1[1]];
  const d3 = [q1[0] - p1[0], q1[1] - p1[1]];

  const denom = cross(d1, d2);
  if (denom === 0) return null; // 平行或重叠

  const t = cross(d3, d2) / denom;

  return [p1[0] + t * d1[0], p1[1] + t * d1[1]];
}

// 判断点是否在多边形内（射线法）
function isInsidePolygon(point, vertices) {
  const [px, py] = point;
  let isInside = false;

  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const [xi, yi] = vertices[i];
    const [xj, yj] = vertices[j];

    const intersect =
      yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;

    if (intersect) isInside = !isInside;
  }

  return isInside;
}

function clipLineWithPolygon(x1, y1, x2, y2, vertices) {
  let start = [x1, y1];
  let end = [x2, y2];
  const clippedPoints = []; // 存储裁剪后的点

  for (let i = 0; i < vertices.length; i++) {
    const p1 = vertices[i];
    const p2 = vertices[(i + 1) % vertices.length]; // 循环边

    if (linesIntersect(start, end, p1, p2)) {
      const intersection = intersectionPoint(start, end, p1, p2);
      if (intersection) {
        clippedPoints.push(intersection);
      }
    }
  }

  // 检查起点和终点是否在多边形内
  if (isInsidePolygon(start, vertices)) {
    clippedPoints.unshift(start);
  }
  if (isInsidePolygon(end, vertices)) {
    clippedPoints.push(end);
  }

  // 如果裁剪点为空，则返回空
  if (clippedPoints.length === 0) return null;

  // 返回裁剪后的起点和终点
  return [clippedPoints[0], clippedPoints[clippedPoints.length - 1]];
}
