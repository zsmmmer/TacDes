function distanceToSegment(px, py, x1, y1, x2, y2) {
    // Vector AB
    const dx1 = x2 - x1;
    const dy1 = y2 - y1;
  
    // Vector AP
    const dx2 = px - x1;
    const dy2 = py - y1;
  
    // Dot products
    const dotProduct = dx2 * dx1 + dy2 * dy1;
    const lengthSquared = dx1 * dx1 + dy1 * dy1;
  
    // Projection scalar t
    const t = dotProduct / lengthSquared;
  
    let closestX, closestY;
  
    // Closest point on the segment
    if (t < 0) {
        closestX = x1;
        closestY = y1;
    } else if (t > 1) {
        closestX = x2;
        closestY = y2;
    } else {
        closestX = x1 + t * dx1;
        closestY = y1 + t * dy1;
    }
  
    // Compute the distance from the point to the closest point on the segment
    const distX = px - closestX;
    const distY = py - closestY;
  
    return Math.sqrt(distX * distX + distY * distY);
  }


function closestPointOnSegment(px, py, x1, y1, x2, y2) {
    // Vector AB
    const dx1 = x2 - x1;
    const dy1 = y2 - y1;
  
    // Vector AP
    const dx2 = px - x1;
    const dy2 = py - y1;
  
    // Dot products
    const dotProduct = dx2 * dx1 + dy2 * dy1;
    const lengthSquared = dx1 * dx1 + dy1 * dy1;
  
    // Projection scalar t
    const t = dotProduct / lengthSquared;
  
    let closestX, closestY;
  
    // Closest point on the segment
    if (t < 0) {
        closestX = x1;
        closestY = y1;
    } else if (t > 1) {
        closestX = x2;
        closestY = y2;
    } else {
        closestX = x1 + t * dx1;
        closestY = y1 + t * dy1;
    }
  
    return [closestX,closestY];
  }