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
    const pathElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );

    // 设置路径属性
    pathElement.setAttribute("d", this.d);
    pathElement.setAttribute("fill", this.fill);
    pathElement.setAttribute("stroke", this.stroke);
    pathElement.setAttribute("stroke-width", this.strokeWidth);

    // 添加到 SVG
    svg.appendChild(pathElement);
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
    type = ""
  ) {
    super(id, d, fill, stroke, strokeWidth); // 调用基类构造函数
    this.vertices = vertices; // 顶点数组
    this.type = type; // 图形类型（如 'polygon', 'curve'）
  }
  // 绘制多边形的方法
  drawPolygon(svg) {
    const polygon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polygon"
    );

    // 设置顶点
    const points = this.vertices.map(([x, y]) => `${x},${y}`).join(" ");
    polygon.setAttribute("points", points);

    // 设置样式
    polygon.setAttribute("fill", this.fill);
    polygon.setAttribute("stroke", this.stroke);
    polygon.setAttribute("stroke-width", this.strokeWidth);

    // 添加到 SVG
    svg.appendChild(polygon);
  }

  drawPolyline(svg) {
    const polyline = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polyline"
    );
  
    // 设置顶点
    polyline.setAttribute("points", this.vertices.map(([x, y]) => `${x},${y}`).join(" "));
  
    // 设置样式
    polyline.setAttribute("fill", fill);
    polyline.setAttribute("stroke", stroke);
    polyline.setAttribute("stroke-width", strokeWidth);
  
    // 添加到 SVG
    svg.appendChild(polyline);
  }
}



const shapes = []; // 存储 Shape 实例
const sensorAreas = []; // 存储 SensorArea 实例
