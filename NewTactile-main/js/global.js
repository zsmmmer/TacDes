let vertices;
let svgOutput;

//UI State definitions
const UserFlowState = {
  WAITING_FOR_GUIDE : "guide",
  WAITING_FOR_LINE_A_POINT_A : "aa",
  WAITING_FOR_LINE_A_POINT_B : "ab",
  WAITING_FOR_LINE_B_POINT_A : "ba",
  WAITING_FOR_LINE_B_POINT_B : "bb",
  WAITING_FOR_EXE : "exe"
}

const selectionTriggerDistance = 10;

let lineAPointA = null;
let lineAPointB = null;
let lineBPointA = null;
let lineBPointB = null;

// 监听文件上传

let userFlowState = UserFlowState.WAITING_FOR_GUIDE;
//const instruction = document.getElementById("instruction");

let selectedPoint = null;

let samplingDistance;
let numOfLines;