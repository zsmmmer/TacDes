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

  function interpolateSegments(a, b, i) {
    // Unpack the input segments
    const [ax1, ay1] = a[0];
    const [ax2, ay2] = a[1];
    const [bx1, by1] = b[0];
    const [bx2, by2] = b[1];

    // 1. Midpoint interpolation
    const mx_a = (ax1 + ax2) / 2;
    const my_a = (ay1 + ay2) / 2;
    const mx_b = (bx1 + bx2) / 2;
    const my_b = (by1 + by2) / 2;

    const mx = (1 - i) * mx_a + i * mx_b;
    const my = (1 - i) * my_a + i * my_b;

    // 2. Length interpolation (Euclidean distance between endpoints)
    const length_a = Math.sqrt(Math.pow(ax2 - ax1, 2) + Math.pow(ay2 - ay1, 2));
    const length_b = Math.sqrt(Math.pow(bx2 - bx1, 2) + Math.pow(by2 - by1, 2));

    const length = (1 - i) * length_a + i * length_b;

    // 3. Angle interpolation (atan2 gives the angle of the line segment)
    const angle_a = Math.atan2(ay2 - ay1, ax2 - ax1);
    const angle_b = Math.atan2(by2 - by1, bx2 - bx1);

    // Interpolate angle
    const angle = (1 - i) * angle_a + i * angle_b;

    // 4. Calculate new endpoints based on interpolated midpoint, length, and angle
    // The new segment will be length units long at the interpolated angle
    const rx1 = mx - (length / 2) * Math.cos(angle);
    const ry1 = my - (length / 2) * Math.sin(angle);
    const rx2 = mx + (length / 2) * Math.cos(angle);
    const ry2 = my + (length / 2) * Math.sin(angle);

    // Return the resulting segment
    return [[rx1, ry1], [rx2, ry2]];
}

function findLineSegmentIntersection(lx1, ly1, lx2, ly2, sx1, sy1, sx2, sy2) {
    // Calculate the slope of the straight line and the segment
    const kLine = (ly2 - ly1) / (lx2 - lx1);
    const kSeg = (sy2 - sy1) / (sx2 - sx1);

    // If the slopes are the same, lines are parallel and do not intersect
    if (kLine === kSeg) {
        return null;
    }

    // Solve for the x-coordinate of the intersection
    const xIntersection = ((kSeg * sx1 - sy1) - (kLine * lx1 - ly1)) / (kSeg - kLine);

    // Calculate the y-coordinate of the intersection using the line equation
    const yIntersection = kLine * (xIntersection - lx1) + ly1;

    // Check if the intersection lies within the bounds of the segment
    if (xIntersection < Math.min(sx1, sx2) || xIntersection > Math.max(sx1, sx2) ||
        yIntersection < Math.min(sy1, sy2) || yIntersection > Math.max(sy1, sy2)) {
        return null;
    }

    // Return the intersection point [x, y]
    return [xIntersection, yIntersection];
}

function findPointLineSegmentIntersection(lx, ly, lk, s1x, s1y, s2x, s2y) {
    // Line equation: y = lk * (x - lx) + ly
    // Segment equation: from (s1x, s1y) to (s2x, s2y)

    // Calculate slope and intercept of the segment
    const segmentSlope = (s2y - s1y) / (s2x - s1x);
    const segmentIntercept = s1y - segmentSlope * s1x;

    // Handle vertical lines (undefined slope)
    const lineIsVertical = !isFinite(lk);
    const segmentIsVertical = !isFinite(segmentSlope);

    let ix, iy;

    if (lineIsVertical) {
        // Line is vertical: x = lx
        ix = lx;
        iy = segmentSlope * ix + segmentIntercept;
    } else if (segmentIsVertical) {
        // Segment is vertical: x = s1x
        ix = s1x;
        iy = lk * (ix - lx) + ly;
    } else {
        // General case: solve for intersection of y = lk * (x - lx) + ly and y = segmentSlope * x + segmentIntercept
        if (lk === segmentSlope) {
            // Parallel lines
            return null;
        }

        ix = (segmentIntercept - ly + lk * lx) / (lk - segmentSlope);
        iy = lk * (ix - lx) + ly;
    }

    // Check if the intersection point lies on the segment
    const isOnSegment = (ix >= Math.min(s1x, s2x) && ix <= Math.max(s1x, s2x)) &&
                        (iy >= Math.min(s1y, s2y) && iy <= Math.max(s1y, s2y));

    if (!isOnSegment) {
        return null;
    }

    return [ix, iy];
}

function findSegmentSegmentIntersection(lx1, ly1, lx2, ly2, sx1, sy1, sx2, sy2) {
    // Calculate the slope of the straight line and the segment
    const kLine = (ly2 - ly1) / (lx2 - lx1);
    const kSeg = (sy2 - sy1) / (sx2 - sx1);

    // If the slopes are the same, lines are parallel and do not intersect
    if (kLine === kSeg) {
        return null;
    }

    // Solve for the x-coordinate of the intersection
    const xIntersection = ((kSeg * sx1 - sy1) - (kLine * lx1 - ly1)) / (kSeg - kLine);

    // Calculate the y-coordinate of the intersection using the line equation
    const yIntersection = kLine * (xIntersection - lx1) + ly1;

    // Check if the intersection lies within the bounds of the segment
    if (xIntersection < Math.min(sx1, sx2) || xIntersection > Math.max(sx1, sx2) ||
        yIntersection < Math.min(sy1, sy2) || yIntersection > Math.max(sy1, sy2)||
        xIntersection < Math.min(lx1, lx2) || xIntersection > Math.max(lx1, lx2) ||
        yIntersection < Math.min(ly1, ly2) || yIntersection > Math.max(ly1, ly2)) {
        return null;
    }

    // Return the intersection point [x, y]
    return [xIntersection, yIntersection];
}