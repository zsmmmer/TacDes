        //start line drawing from here

        //first, find one or more pairs of intersections between each y parallel and the sensor area
        let verticalLineKeyPoints = [];
        for(let y = 0; y <= canvasHeight; y+=parallelScanSamplingDistance){
          let intersections = findPolygonLineYIntersections(vertices, y);
  
          if(intersections.length%2!=0){
            console.log('Intersections are not in pairs. Might generate error.');
          }
          if(intersections.length == 0){
            continue;//no intersection. don't draw. 
          }
  
          //identify the two pairs on both edges of it
          let minX = canvasWidth;
          let maxX = 0;
      
          for (const point of intersections) {
              if (point[0] < minX) minX = point[0];
              if (point[0] > maxX) maxX = point[0];
          }
          // now minX and maxX are found
          //next, evenly divide the segment by vertical lines
          let verticalXs = [];
          let dx = (maxX-minX)/(numOfVerticalLines+1);
          for(let i = 1; i <= numOfVerticalLines; i++){
            let xi = minX + i*dx;
            verticalXs.push(xi);
          }
          verticalLineKeyPoints.push({y: y,verticalXs: verticalXs});
          
        }
  
        //formula for (n+1)th vertical curve:
        //[verticalLineKeyPoints[m].verticalXs[n], verticalLineKeyPoints[m].y], where m = [0 : verticalLineKeyPoints.length-1]
  
        for(let n=0; n<numOfVerticalLines; n++){
          let polyline = []
          for(let m=0; m<verticalLineKeyPoints.length;m++){
            polyline.push([verticalLineKeyPoints[m].verticalXs[n], verticalLineKeyPoints[m].y]);
          }

          //draw polylines
          drawPolyline(svgOutput,polyline,"none","pink",1);


        }
  




  
        //do exact same thing for x parallels
        let horizontalLineKeyPoints = [];
        for(let x = 0; x <= canvasWidth; x+=parallelScanSamplingDistance){
          let intersections = findPolygonLineXIntersections(vertices, x);
  
          if(intersections.length%2!=0){
            console.log('Intersections are not in pairs. Might generate error.');
          }
          if(intersections.length == 0){
            continue;//no intersection. don't draw. 
          }
  
          //identify the two pairs on both edges of it
          let minY = canvasHeight;
          let maxY = 0;
      
          for (const point of intersections) {
              if (point[1] < minY) minY = point[1];
              if (point[1] > maxY) maxY = point[1];
          }
          // now minY and maxY are found
          //next, evenly divide the segment by vertical lines
          let horizontalYs = [];
          let dy = (maxY-minY)/(numOfHorizontalLines+1);
          for(let i = 1; i <= numOfHorizontalLines; i++){
            let yi = minY + i*dy;
            horizontalYs.push(yi);
          }
          horizontalLineKeyPoints.push({x: x,horizontalYs: horizontalYs});
          
        }
  
        //formula for (n+1)th vertical curve:
        //[verticalLineKeyPoints[m].verticalXs[n], verticalLineKeyPoints[m].y], where m = [0 : verticalLineKeyPoints.length-1]
  
        for(let n=0; n<numOfHorizontalLines; n++){
          let polyline = []
          for(let m=0; m<horizontalLineKeyPoints.length;m++){
            polyline.push([horizontalLineKeyPoints[m].x, horizontalLineKeyPoints[m].horizontalYs[n]]);
          }

          //draw polylines
          drawPolyline(svgOutput,polyline,"none","cyan",1);
        }
      }