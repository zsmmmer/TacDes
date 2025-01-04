function execute(){
    //both line are initialized
    ax1 = lineAPointA[0];
    ax2 = lineAPointB[0];
    ay1 = lineAPointA[1];
    ay2 = lineAPointB[1];
    bx1 = lineBPointA[0];
    bx2 = lineBPointB[0];
    by1 = lineBPointA[1];
    by2 = lineBPointB[1];

    //find two midpoints
    const mx_a = (ax1 + ax2) / 2;
    const my_a = (ay1 + ay2) / 2;
    const mx_b = (bx1 + bx2) / 2;
    const my_b = (by1 + by2) / 2;

    //get length between two midpoints
    const md = Math.sqrt(Math.pow(mx_b - mx_a, 2) + Math.pow(my_b - my_a, 2));
    const sampleNum = Math.floor(md/samplingDistance) - 1;
    let contourScanSegments = [];
    for(let n = 1; n <= sampleNum; n++){
        const i = n*samplingDistance/md;
        //const s = interpolateSegments([lineAPointA,lineAPointB],[lineBPointA,lineBPointB],i);// overkill in this case

        //line a p a to line b p a
        const pax = (1 - i) * lineAPointA[0] + i * lineBPointA[0];
        const pay = (1 - i) * lineAPointA[1] + i * lineBPointA[1];

        //line a p b to line b p b
        const pbx = (1 - i) * lineAPointB[0] + i * lineBPointB[0];
        const pby = (1 - i) * lineAPointB[1] + i * lineBPointB[1];

        //segment ready
        // const lx1 = s[0][0];
        // const ly1 = s[0][1];
        // const lx2 = s[1][0];
        // const ly2 = s[1][1];
        contourScanSegments.push([]);
        
        for (let m = 0; m < vertices.length; m++) {
            // Get the current and next vertex
            const [sx1, sy1] = vertices[m];
            const [sx2, sy2] = vertices[(m + 1) % vertices.length]; // Wrap around to the first vertex

            const intersection = findLineSegmentIntersection(pax, pay, pbx, pby, sx1, sy1, sx2, sy2);

            if(intersection){
                contourScanSegments[n-1].push(intersection);
            }
      
        }
        console.log(`Line ${n} intersections: ${contourScanSegments[n-1]}`);
        //check if on same sides
        if(n>1){
            const s0 = contourScanSegments[n-2];
            const s1 = contourScanSegments[n-1];
            if(findSegmentSegmentIntersection(s0[0][0],s0[0][1], s1[0][0],s1[0][1] ,s0[1][0],s0[1][1],s1[1][0],s1[1][1])){
                //swap contents in s1
                s1s = s1[0];
                console.log(`intersection found at line ${n}`);
                contourScanSegments[n-1][0]=s1[1];
                contourScanSegments[n-1][1]=s1s;
                console.log(`New intersections: ${contourScanSegments[n-1]}`);
                

            }


    `` }
       

        drawLine(contourScanSegments[n-1][0],contourScanSegments[n-1][1],`${n}thScanLine`)
    }
    //draw lines based on contour scan scan segments for testing

    //each poly line: find all of its keypoints, each from one scannned line. 
    for(let lineNum = 1; lineNum <= numOfLines; lineNum++){
        const linePos = lineNum/(numOfLines+1);
        let ks = keypoints(contourScanSegments, linePos);
        drawPolyline(svgOutput, ks, "none", "pink", 1);
    }

}

function keypoints(contourScanSegments, linePos){
    //return array of keypoints the length of scane segment at linepos(between 0 and 1)
    let result = [];
    for(let n = 0; n < contourScanSegments.length; n++){
        if(contourScanSegments[n].length<2){
            continue;
        }
        const pax = contourScanSegments[n][0][0];
        const pay = contourScanSegments[n][0][1];
        const pbx = contourScanSegments[n][1][0];
        const pby = contourScanSegments[n][1][1];

        const pix = (1 - linePos) * pax + linePos * pbx;
        const piy = (1 - linePos) * pay + linePos * pby;
        result.push([pix,piy]);
    }
    return result;
}