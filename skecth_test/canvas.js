/*=================================================
                          UI
===================================================*/
/*Variable Naming Principles：
Use the path of the selector, and capitalise the first letter after the first word.
eg: .toolbar button -> toolbarButton
If the return value is an array, add s at the end. eg. toolbarButtons
*/

// -- Variables - 变量区域 --
const toolbarButtons = document.querySelectorAll(".toolbar button");

// -- Initialization - 初始化区域 --

// -- Event Listeners Area - 事件监听区域 --

// 为每个按钮添加点击事件 - Add click event for each button
toolbarButtons.forEach((toolbarButton) => {
  toolbarButton.addEventListener("click", () => {
    // 重置所有按钮的 is-selected 属性和背景颜色 - Reset is-selected attribute and background color for all buttons
    toolbarButtons.forEach((btn) => {
      btn.setAttribute("is-selected", "False"); // 设置 is-selected 为 "False" - Set is-selected to "False"
      btn.style.backgroundColor = ""; // 重置背景颜色 - Reset background color
    });

    // 设置当前按钮的 is-selected 属性为 True，并改变背景颜色 - Set is-selected to "True" and change background color for the selected button
    toolbarButton.setAttribute("is-selected", "True");
    toolbarButton.style.backgroundColor = "#4CAF50"; // 选中颜色 - Selected color
  });
});

// -- Event Handlers - 事件处理函数区域 --

// -- Utility Functions - 工具函数区域 --

/*=================================================
            Graphics Processing Area
===================================================*/
// – Shape Classes - 图形类定义 –
class Shape {
  constructor(type, x, y, options = {}) {
    // 初始化通用属性 - Initialize common properties
    this.type = type; // 图形类型 - Type of shape (e.g., 'rect', 'circle', 'polygon')
    this.x = x; // 形状的参考点位置 - Reference point of shape
    this.y = y;
    this.isSelected = false; // 是否选中 - Selection state
    this.element = null; // 存储 SVG 元素 - To store SVG element

    // 基于图形类型绘制不同的基础图形 - Draw different shapes based on the type
    switch (this.type) {
      case "rect":
        this.width = options.width || 100;
        this.height = options.height || 100;
        this.drawRect(); // 绘制矩形 - Draw rectangle
        break;
      case "circle":
        this.radius = options.radius || 50;
        this.drawCircle(); // 绘制圆形 - Draw circle
        break;
      case "ellipse":
        this.rx = options.rx || 75; // x 轴半径 - x-axis radius
        this.ry = options.ry || 50; // y 轴半径 - y-axis radius
        this.drawEllipse(); // 绘制椭圆 - Draw ellipse
        break;
      case "line":
        this.x2 = options.x2 || x + 100;
        this.y2 = options.y2 || y + 100;
        this.drawLine(); // 绘制线条 - Draw line
        break;
      case "polygon":
        this.vertices = options.vertices || [];
        this.drawPolygon(); // 绘制多边形 - Draw polygon
        break;
      case "polyline":
        this.points = options.points || [];
        this.drawPolyline(); // 绘制多边线 - Draw polyline
        break;
      case "path":
        this.d = options.d || "M10 10 H 90 V 90 H 10 L 10 10"; // 默认路径 - Default path
        this.drawPath(); // 绘制路径 - Draw path
        break;
      default:
        console.error("Unsupported shape type"); // 不支持的图形类型 - Unsupported shape type
    }
  }

  // 绘制矩形 - Draw rectangle
  drawRect() {
    this.element = draw
      .rect(this.width, this.height)
      .move(this.x, this.y)
      .fill("blue");
  }

  // 绘制圆形 - Draw circle
  drawCircle() {
    this.element = draw
      .circle(this.radius * 2)
      .move(this.x, this.y)
      .fill("green");
  }

  // 绘制椭圆 - Draw ellipse
  drawEllipse() {
    this.element = draw
      .ellipse(this.rx * 2, this.ry * 2)
      .move(this.x, this.y)
      .fill("red");
  }

  // 绘制线条 - Draw line
  drawLine() {
    this.element = draw
      .line(this.x, this.y, this.x2, this.y2)
      .stroke({ width: 2, color: "black" });
  }

  // 绘制多边形 - Draw polygon
  drawPolygon() {
    if (this.vertices.length > 0) {
      this.element = draw
        .polygon(this.vertices)
        .fill("none")
        .stroke({ width: 1, color: "black" });
    } else {
      console.error("No vertices provided for polygon");
    }
  }

  // 绘制多边线 - Draw polyline
  drawPolyline() {
    if (this.points.length > 0) {
      this.element = draw
        .polyline(this.points)
        .fill("none")
        .stroke({ width: 1, color: "black" });
    } else {
      console.error("No points provided for polyline");
    }
  }

  // 绘制路径 - Draw path
  drawPath() {
    this.element = draw
      .path(this.d)
      .fill("none")
      .stroke({ width: 1, color: "black" });
  }

  // Select the shape 选中图形
  select() {
    this.isSelected = true;
    if (this.element) {
      this.element.stroke({ color: "blue", width: 2 }); // Change color when selected 选中时改变颜色
    }
  }

  // Deselect the shape 取消选中
  deselect() {
    this.isSelected = false;
    if (this.element) {
      this.element.stroke({ color: "black", width: 1 }); // Restore default color 恢复默认颜色
    }
  }

  // Move the shape 移动图形
  move(dx, dy) {
    this.x += dx;
    this.y += dy;
    if (this.element) {
      this.element.translate(dx, dy); // Translate the SVG element 平移 SVG 图形
    }
  }

  // Scale the shape 缩放图形
  scale(factor) {
    if (this.element) {
      this.element.scale(factor); // Scale the SVG element 缩放 SVG 图形
    }
  }

  // Convert the shape 转换图形
  convert() {
    // Shape conversion logic 图形转换逻辑
  }
}
