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
  
  function drawPoint(point, id){
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("id",`${id}`);
    circle.setAttribute("r","5");    
    circle.setAttribute("cx",`${point[0]}`);
    circle.setAttribute("cy",`${point[1]}`);
    circle.setAttribute("fill", "blue");
    svgOutput.appendChild(circle);
  }

  function drawLine(start,end,id){
    const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
    );
    line.setAttribute("id",`${id}`);
    //console.log(`the start is ${start[0]}`);
    line.setAttribute("x1", `${start[0]}`);
    line.setAttribute("y1", `${start[1]}`);
    line.setAttribute("x2", `${end[0]}`);
    line.setAttribute("y2", `${end[1]}`);
    line.setAttribute("stroke","blue");
    line.setAttribute("stroke-width","1");
    svgOutput.appendChild(line);

  }