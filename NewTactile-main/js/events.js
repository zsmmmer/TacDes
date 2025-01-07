
function mouseMoved(event){
    console.log("mousemoved");
    if(userFlowState==UserFlowState.WAITING_FOR_GUIDE){
        return;//exit immediately
    }

    //const svgOutput = document.getElementById("output");
    let x = event.clientX;
    let y = event.clientY;
    //determine whether the mouse is near a contour line
  
    //find the coordinate of the svg file
    r = svgOutput.getBoundingClientRect();
  
    //determine the x, y selection inside the svg box
  
    let svgx = x-r.x;
    let svgy = y-r.y;
  
    //determine if it is near contour, if so where? 
    let shortestDistance = selectionTriggerDistance;
    selectedPoint = null;
    for (let i = 0; i < vertices.length; i++) {
      // Get the current and next vertex
      const [x1, y1] = vertices[i];
      const [x2, y2] = vertices[(i + 1) % vertices.length]; // Wrap around to the first vertex
  
      //check if the point is near the segment enough
      let distance = distanceToSegment(svgx,svgy,x1,y1,x2,y2);
      if (distance <selectionTriggerDistance){
        //is selected
        if(distance<=shortestDistance){
            selectedPoint = closestPointOnSegment(svgx,svgy,x1,y1,x2,y2);
            shortestDistance = distance;
        }
  
      }
  
  
  
  
  
    }
   //check if there is any selection
   const circle = svgOutput.getElementById("selectedPoint")
   if(selectedPoint){
      //draw the point as circle
      
      console.log(`circle: ${circle}`);
      circle.setAttribute("cx",`${selectedPoint[0]}`);
      circle.setAttribute("cy",`${selectedPoint[1]}`);
      circle.setAttribute("fill", "red") 
  
   } else {
      circle.setAttribute("fill","none");
   }
  
  
  }

  function mouseClicked(event){
    console.log("mouseclicked");
    if(selectedPoint){
        //store the point selected
        switch(userFlowState){
            case UserFlowState.WAITING_FOR_GUIDE:
                break;
            case UserFlowState.WAITING_FOR_LINE_A_POINT_A:
                lineAPointA = selectedPoint;
                //update render
                drawPoint(lineAPointA,"lineAPointA");
                userFlowState = UserFlowState.WAITING_FOR_LINE_A_POINT_B;
                //update instruction
                document.getElementById("instruction").innerHTML = "Please select the ending point of the entry scan line on the contour";
                break;

            case UserFlowState.WAITING_FOR_LINE_A_POINT_B:
                lineAPointB = selectedPoint;
                drawPoint(lineAPointB,"lineAPointB");
                //draw a line as well
                drawLine(lineAPointA,lineAPointB,"lineA");
                userFlowState = UserFlowState.WAITING_FOR_LINE_B_POINT_A;
                document.getElementById("instruction").innerHTML = "Please select the starting point of the exit scan line on the contour";
                break;
            // case UserFlowState.WAITING_FOR_LINE_B_POINT_A:
            //     lineBPointA = selectedPoint;
            case UserFlowState.WAITING_FOR_LINE_B_POINT_A:
                lineBPointA = selectedPoint;
                //update render
                drawPoint(lineBPointA,"lineBPointA");
                userFlowState = UserFlowState.WAITING_FOR_LINE_B_POINT_B;
                //update instruction
                document.getElementById("instruction").innerHTML = "Please select the ending point of the exit scan line on the contour";
                break;

            case UserFlowState.WAITING_FOR_LINE_B_POINT_B:
                lineBPointB = selectedPoint;
                drawPoint(lineBPointB,"lineBPointB");
                //draw a line as well
                drawLine(lineBPointA,lineBPointB,"lineB");
                userFlowState = UserFlowState.WAITING_FOR_EXE;
                //enable button
                document.getElementById("generate").disabled = false;
                document.getElementById("instruction").innerHTML = "Ready to execute";
                break;
                


            default:
                break;

        }
    }
  }