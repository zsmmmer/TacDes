function mouseMoved(event){
    
    if(userFlowState==UserFlowState.WAITING_FOR_UPLOAD){
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
    let selectedPoint = null;
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
   if(selectedPoint){
      //draw the point as circle
      const circle = svgOutput.getElementById("selectedPoint")
      circle.setAttributeNS("cx",`${selectedPoint[0]}`);
      circle.setAttributeNS("cy",`${selectedPoint[1]}`);
      circle.setAttributeNS("fill", "red")
  
  
   }
  
  
  }