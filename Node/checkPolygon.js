module.exports = {checkPolygon, onSegment, orientation};

function checkPolygon(polygon, point) {
    const infinite = 1;

    polygon.forEach((element, index) => {
        polygon[index] = {x: element[0], y: element[1]}    
    });

    if (polygon.length < 3) {
        return false;
    }

    let startPoint = {x: point[0], y: point[1]};
    let infPoint = { x: point[0] + infinite, y: point[1]};

    let intersections = 0;
    for (let i = 0; i <= polygon.length - 1; i++) {
        let next = i >= polygon.length - 1 ? 0 : i+1;
        if (doIntersect(polygon[i], polygon[next], startPoint, infPoint)) {
            if (orientation(polygon[i], startPoint, polygon[next]) == 0) {
                return onSegment(polygon[i], startPoint, polygon[next]);
            }
            intersections++;
        }
    }

    return (intersections % 2 == 1);
}

//Given 3 points on the same line (p, q, r), returns "true" if q lies between p and r (on the segment pr)
function onSegment(p, q, r) {
    if (q.x <= Math.max(p.x, r.x) && 
        q.x >= Math.min(p.x, r.x) && 
        q.y <= Math.max(p.y, r.y) && 
        q.y >= Math.min(p.y, r.y)) {
        return true;    
    }
    return false;
}

//Finds the orientation of 3 points (p, q, r) in relation to eachother
//If the points are collinear (lies on the same line), the function returns 0
//Returns 1 if clockwise, returns 2 if counter clockwise
function orientation(p, q, r) {
    
    let value = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y); 
    if (value == 0) { 
        return 0;
    }
    return (value > 0) ? 1 : 2;
}

//Checks if line segment "p1q1" intersects with line segment "p2q2"
function doIntersect(p1, q1, p2, q2) {
    let o1 = orientation(p1, q1, p2);
    let o2 = orientation(p1, q1, q2);
    let o3 = orientation(p2, q2, p1);
    let o4 = orientation(p2, q2, q1);

    if (o1 != o2 && o3 != o4) {
        return true;
    }

    if (o1 == 0 && onSegment(p1, p2, q1)) {
        return true;
    }

    if (o2 == 0 && onSegment(p1, q2, q1)) {
        return true;
    }

    if (o3 == 0 && onSegment(p2, p1, q2)) {
        return true;
    }

    if (o4 == 0 && onSegment(p2, q1, q2)) {
        return true;
    }

    return false;
}

