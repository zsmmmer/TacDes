document.querySelectorAll(".imgframe").forEach((button) => {
  button.addEventListener("click", () => {
    // 清除所有按钮的选中状态
    document
      .querySelectorAll(".imgframe")
      .forEach((btn) => btn.classList.remove("selected"));

    // 为当前点击的按钮添加选中状态
    button.classList.add("selected");
  });
});
// 获取所有 imgframe 按钮和对应的参数部分
const imgFrameButtons = document.querySelectorAll(".imgframe");
const parameterSections = document.querySelectorAll(".parameter");

// 为每个 imgframe 按钮添加点击事件
imgFrameButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    // 清除所有按钮的选中状态
    imgFrameButtons.forEach((btn) => btn.classList.remove("selected"));

    // 隐藏所有参数部分
    parameterSections.forEach((param) => param.classList.remove("visible"));

    // 为当前点击的按钮添加选中状态
    button.classList.add("selected");

    // 显示与当前按钮匹配的参数部分
    if (parameterSections[index]) {
      parameterSections[index].classList.add("visible");
    }
  });
});

// 根据数据生成 HTML
shapes.forEach((shape, index) => {
  // 创建 item 或 spanitem 容器
  const itemDiv = document.createElement("div");
  itemDiv.className = shape instanceof SensorArea ? "spanitem" : "item";

  // 创建 name 部分
  const nameDiv = document.createElement("div");
  nameDiv.className = "name";

  const numberSpan = document.createElement("span");
  numberSpan.className = "number";
  numberSpan.textContent = index + 1;

  const imgElement = document.createElement("img");
  imgElement.className = "img";
  imgElement.src =
    shape instanceof SensorArea
      ? "./assets/toolbar/sensor.png"
      : shape instanceof Connector
      ? "./assets/toolbar/connector.png"
      : "./assets/toolbar/shape2.png";

  const buttonTxt = document.createElement("button");
  buttonTxt.className = "txt";
  buttonTxt.textContent =
    shape instanceof SensorArea
      ? `Sensor Area ${index + 1}`
      : shape instanceof Connector
      ? `Connector x${shape.points}`
      : `Shape ${index + 1}`;

  // 组合 name 部分
  nameDiv.appendChild(numberSpan);
  nameDiv.appendChild(imgElement);
  nameDiv.appendChild(buttonTxt);

  // 创建 stage 部分
  const stageDiv = document.createElement("div");
  stageDiv.className = "stage";

  const icons = [
    "./assets/rightpanel/dot.png",
    "./assets/rightpanel/eye.png",
    "./assets/rightpanel/circle.png",
    shape instanceof SensorArea
      ? "./assets/rightpanel/shouqi.png"
      : "./assets/rightpanel/zhankai.png",
  ];

  icons.forEach((iconSrc) => {
    const button = document.createElement("button");
    button.className = "choices";

    const img = document.createElement("img");
    img.src = iconSrc;
    img.className = "choices";

    button.appendChild(img);
    stageDiv.appendChild(button);
  });

  // 将 name 和 stage 部分组合到 item 或 spanitem
  itemDiv.appendChild(nameDiv);
  itemDiv.appendChild(stageDiv);

  // 添加到主容器
  listContainer.appendChild(itemDiv);
});

// 获取所有 .unit 按钮（即 footerbuttons）
const footerbuttons = document.querySelectorAll(".footer .unit");

// 遍历每个按钮并绑定事件
footerbuttons.forEach((button) => {
  button.addEventListener("click", () => {
    // 获取按钮对应的图层 ID
    const layerId = button.getAttribute("data-layer");
    const layer = document.getElementById(layerId);

    // 切换按钮选中状态
    const isSelected = button.classList.contains("is-selected");
    if (isSelected) {
      button.classList.remove("is-selected");
      layer.style.display = "none"; // 隐藏图层
    } else {
      button.classList.add("is-selected");
      layer.style.display = "block"; // 显示图层
    }
  });
});
