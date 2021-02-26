async function getPlanets(){
    
    return await fetch('https://findfalcone.herokuapp.com/planets')
                      .then(data => data.json())
                      .then(array => array.reduce((obj, element) => {
                                        obj[element.name] = {'distance': element.distance}; 
                                        return obj; 
                                     }, {})
                      ); 


/*
    [                                           {
        {                                           
            "name": "Donlon",        ===>>>       "Donlon" : {"distance" : 100},
            "distance": 100
        },                                        .
    .                                             .
    .                                             .
    .                                             .
    ]                                           } 
*/

}


async function getVehicles(){
    return await fetch('https://findfalcone.herokuapp.com/vehicles')
                      .then(data => data.json())
                      .then(array => array.reduce((obj, element) => {
                                        obj[element.name] = {
                                            'total_no'    : element.total_no,
                                            'max_distance': element.max_distance,
                                            'speed'       : element.speed 
                                        };
                                        return obj
                                    }, {})
                      );

/*
    [                                           {
        {
            "name": "Space pod",     ===>>>            "Space pod" :  {
            "total_no": 2,                                               "total_no": 2,
            "max_distance": 200,                                         "max_distance": 200,
            "speed": 2                                                   "speed": 2
        },                                                            },
        .                                              . 
        .                                              . 
        .                                              .
    ]                                            }
*/
}

function populateList(planets, chosenPlanets, event){
    let listId = event.target.id; 
    let node = document.getElementById(listId); 
    

    if(chosenPlanets[+listId]){
        //node.innerHTML = ""; 
        node.innerHTML = `<option selected value='${event.target.value}'>${event.target.value} (${planets[event.target.value].distance})</option>`; // keeping the current value selected to prevent the item selected display going blank when planet selection is not changed, also to prevent needless invocation of selectPlanet() which also resets the vehicle selected
    }
    else{
        node.innerHTML = `<option selected disabled value=''>Select</option>`; 
    }
    

    
    Object.keys(planets)
          .filter(p => (!chosenPlanets.includes(p)))
          .forEach(p => node.innerHTML += `<option value="${p}">${p} (${planets[p].distance})</option>\n`); 
    
}



function createVehicleList(vehicles, planetDistance, listNo){

    document.querySelectorAll(".list > .vehicleToggle")[+listNo].innerHTML = ""; //

    Object.keys(vehicles)
          .forEach(vehicle => {
                        document.querySelectorAll(".list > .vehicleToggle")[+listNo].innerHTML += 
                                                                        `
                                                                        <input type="radio" name="vehicle${listNo}" value="${vehicle}" id="${vehicle}${listNo}" onchange="selectVehicle(event)">\n
                                                                        <label for="${vehicle}${listNo}">${vehicle} (${vehicles[vehicle].max_distance})</label>\n
                                                                        <br>\n
                                                                        `;

                        if(vehicles[vehicle].max_distance < planetDistance){ // disable choice if planet is out of reach of the vehicle
                            document.getElementById(`${vehicle}${listNo}`).disabled = 'true'; 
                        }
                    });
    
}

function updateVehicleTable(chosenV){

}

function updateTime(timeStamps, distance, speed, index){
    timeStamps[index] = distance / speed; 

    document.getElementById('total_time').innerHTML = timeStamps.reduce((total, time) => {
                                                                        if(Number.isInteger(time)){
                                                                            return total + time; 
                                                                        }
                                                                 }, 0)
    

    return timeStamps; 
}



function checkReady(timeStamps){
    let count = 0; 
    timeStamps.forEach(x =>{
                    if(Number.isInteger(x)) count++; // to count non-empty values (array has empty values when one doesn't make selection in sequence)
                });

   if(count === 4){
        document.getElementById('trigger').disabled = false; // enable 'Find Falcone!' button after complete selection    
    }
}



async function checkResult(chosenPlanets, chosenVehicles, timeStamps){
    if(document.getElementById('trigger').disabled) return ;

    let data = {
        "token" : "",
        "planet_names": chosenPlanets,
        "vehicle_names": chosenVehicles
    };

    data.token = (await fetch('https://findfalcone.herokuapp.com/token', {
                        method: 'POST', // or 'PUT'
                        headers: {
                            'Accept': 'application/json',
                        },
                        body: {},
                    })
                    .then(response => response.json()))
                    .token; 

     
    let result = await fetch('https://findfalcone.herokuapp.com/find', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json', 
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify(data)
             })
             .then(response => response.json());
             

    
    localStorage.setItem('result', JSON.stringify(result)); 
    localStorage.setItem('time', timeStamps.reduce((T,t) => T + t, 0));

    resultPage(); // go to results page
}

function resultPage(){
    window.location.href = "/result.html"; 
}

function getResult(){
    let result = JSON.parse(localStorage.getItem('result')); 
    let time = localStorage.getItem('time'); 

    document.getElementById('result').innerHTML = ``;

    if(result.status === 'success'){
        document.getElementById('result').innerHTML += `<p>It was a ${result.status}!!</p>
                                                        <p>Found Falcone on ${result.planet_name}!!</p>
                                                        <p>Time taken: ${time}</p>
                                                        `;
    }

    else{
        document.getElementById('result').innerHTML += '<p>Mission Failed!!</p>';
    }

    
    
}

export {
    getPlanets,
    getVehicles,
    populateList,
    createVehicleList,
    updateVehicleTable, 
    updateTime,
    checkReady, 
    checkResult, 
    getResult
};