const checkPolygon = require('../checkPolygon.js');

test('onSegment', ()=>{
    expect(checkPolygon.onSegment({x: -1.78, y: -0.36}, {x: 5.44, y: 4.85}, {x: 14.01, y: 11.04})).toBeTruthy();
})

test('aboveSegment', ()=>{
    expect(checkPolygon.onSegment({x: -1.78, y: -0.36}, {x: 4.71, y: 6.26}, {x: 14.01, y: 11.04})).toBeTruthy();
})

test('awayFromSegment', ()=>{
    expect(checkPolygon.onSegment({x: -1.78, y: -0.36}, {x: 16.24, y: 14.9}, {x: 14.01, y: 11.04})).toBeFalsy();
})



test('clockWise', ()=>{
    expect(checkPolygon.orientation({x: -1.78, y: -0.36}, {x: 10.61, y: 2.09}, {x: 14.01, y: 11.04})).toBe(2);
})

test('counterClockWise', ()=>{
    expect(checkPolygon.orientation({x: -1.78, y: -0.36}, {x: 4.71, y: 6.26}, {x: 14.01, y: 11.04})).toBe(1);
})

test('collinearClockWise', ()=>{
    expect(checkPolygon.orientation({x: 0.00, y: 0.00}, {x: 7.00, y: 6.00}, {x: 14.00, y: 12.00})).toBe(0);
})


