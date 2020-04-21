async function postFire(location, typeFire, time, automaticAlarm, active, id) {
    fetch('http://127.0.0.1:3000/fireAlert', {method:'POST', body: JSON.stringify({location: location, 
    typeFire: typeFire, 
    time: time, 
    automaticAlarm: automaticAlarm, 
    active: active, 
    id: id})})
console.log('Message');
}

async function getFire() {
    let response = await fetch("http://127.0.0.1:3000/fires");
    let data = await response.json();
    console.log(data);
}