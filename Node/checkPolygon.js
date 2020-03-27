module.exports = {checkPolygon};

function checkPolygon(polygon, point) {
    const infinite = 1;

polygon.forEach((element, index) => {
    polygon[index] = {x: element[0], y: element[1]}    
});
console.log(onSegment({x: 3.3, y: 1.63}, {x: 20.97, y: 9.17}, {x: 200.57, y: 98.83}));
}

//Givet 3 punkter der er på samme linje (p, q, r), returneres "true" hvis q ligger mellem (på segmentet) p, r
function onSegment(p, q, r) {
    if (q.x <= Math.max(p.x, r.x) && 
        q.x >= Math.min(p.x, r.x) && 
        q.y <= Math.max(p.y, r.y) && 
        q.y >= Math.min(p.y, r.y)) {
        
        return true;    
    }
    return false;
}

//??
function orientation(p, q, r) {
    let value = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y); 
    if (value == 0) { 
        return 0;
    }
    return (value > 0) ? 1 : 2;
}
