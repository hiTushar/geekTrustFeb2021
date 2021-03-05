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

/********************************************************************************/

async function getVehicles(){
    return await fetch('https://findfalcone.herokuapp.com/vehicles')
                      .then(data => data.json())
                      .then(array => array.reduce((obj, element) => {
                                        obj[element.name] = {
                                            'total_no'    : element.total_no,
                                            'total_left'  : element.total_no, // No. of vehicles available
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
                                                                         "total_left": 2, 
            "max_distance": 200,                                         "max_distance": 200,
            "speed": 2                                                   "speed": 2
        },                                                            },
        .                                              . 
        .                                              . 
        .                                              .
    ]                                            }
*/
}

/********************************************************************************/

function createPlanetList(planets, chosenPlanets, event){
    if(event.target.localName === 'option') return; // inadvertent mouse-down event

    let listId = event.target.id; 
    let node = document.getElementById(listId); 
    
    // reset node.innerHTML, each time list is clicked upon, as per whether or not any selection has been made
    if(chosenPlanets[+listId]){
      
        node.innerHTML = `<option selected value='${event.target.value}'>${event.target.value} (${planets[event.target.value].distance})</option>`; // keeping the current value selected to prevent the item selected display going blank when planet selection is not changed, also to prevent needless invocation of selectPlanet() which also resets the vehicle selected
    }
    else{
        node.innerHTML = `<option selected disabled value=''>Select</option>`; 
    }
    

    
    Object.keys(planets)
          .filter(p => (!chosenPlanets.includes(p)))
          .forEach(p => node.innerHTML += `<option value="${p}">${p} (${planets[p].distance})</option>\n`); 
    
}

/********************************************************************************/

function createVehicleList(vehicles, chosenVehicles, planetDistance, event){


    let listId = event.target.id.slice(-1); 
    let node = document.getElementById(`v${listId}`); 

    node.removeAttribute('disabled');
    // reset node.innerHTML, each time list is clicked upon, as per whether or not any selection has been made
    if(Object.keys(vehicles).includes(chosenVehicles[+listId])){ 
    
        node.innerHTML = `<option selected value='${event.target.value}'>${event.target.value}</option>`; // keeping the current value selected to prevent the item selected display going blank when vehicle selection is not changed, also to prevent needless invocation of selectPlanet()
    }
    else{
        node.innerHTML = `<option selected disabled value=''>Select Vehicle</option>`; 
    }
    
    Object.keys(vehicles)
          .filter(v => (vehicles[v].max_distance >= planetDistance && vehicles[v].total_left > 0))
          .forEach(v => node.innerHTML +=  `<option value="${v}">${v}</option>\n`); 

}

/********************************************************************************/

function updateVehicleInventory(chosenVehicles, vehicles){
     

    Object.keys(vehicles).forEach(v => {
                             vehicles[v].total_left = vehicles[v].total_no; // reset all
                         });
  
    
    chosenVehicles.forEach(v => {
                      if(!v) return; // a planet has been reset and so has the vehicle
                      vehicles[v].total_left--;
                  })
    

    populateTable(vehicles); 

    return vehicles; 
}

/********************************************************************************/

function populateTable(vehicles){
    
    document.getElementById('inventory').innerHTML = 
                                                 `
                                                  <table>
                                                    <thead>
                                                      <tr>
                                                        <th>VEHICLE</th>
                                                        <th>AVAILABLE</th>
                                                        <th>MAX DISTANCE</th>
                                                        <th>SPEED</th>
                                                      </tr>
                                                    </thead>
                                                    <tbody>
                                                    </tbody>
                                                  </table>
                                                 `;
                                                 
    Object.keys(vehicles).forEach(v => {
                document.querySelector("#inventory tbody").innerHTML +=  
                                                                     `
                                                                     <tr>
                                                                      <td>${v}</td>
                                                                      <td>${vehicles[v].total_left}</td>
                                                                      <td>${vehicles[v].max_distance}</td>
                                                                      <td>${vehicles[v].speed}</td>
                                                                     </tr>
                                                                     `
            });
}

/********************************************************************************/

function updateTime(timeStamps, distance, speed, index){
    timeStamps[index] = distance / speed; 

    document.getElementById('total_time').innerHTML = timeStamps.reduce((total, time) => {
                                                                        if(Number.isInteger(time)){
                                                                            return total + time; 
                                                                        }
                                                                 }, 0)
    

    return timeStamps; 
}

/********************************************************************************/

function checkReady(timeStamps){
    let count = 0; 
    timeStamps.forEach(x =>{
                    if(Number.isInteger(x)) count++; // to count non-empty values (array has empty values when one doesn't make selection in sequence)
                });

   if(count === 4){
        document.getElementById('trigger').disabled = false; // enable 'Find Falcone!' button after complete selection    
    }
}

/********************************************************************************/

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
             

    // saving values to localStorage to recall on next page
    let totalTime = timeStamps.reduce((T,t) => T + t, 0); 
    localStorage.setItem('result', JSON.stringify(result)); 
    localStorage.setItem('time', totalTime);

    
    if(result.status === 'success'){
        if(localStorage.getItem('timeBest')){ // previous record exists
            if(totalTime < localStorage.getItem('timeBest')) 
                localStorage.setItem('timeBest', totalTime); // update to the least time taken
        }
        else{
            localStorage.setItem('timeBest', totalTime);
        }
        
    }
    

    resultPage(); // go to results page
}

/********************************************************************************/

function resultPage(){
    window.location.href = "result.html"; 
}

/********************************************************************************/

function viewResult(){
    let result = JSON.parse(localStorage.getItem('result')); 
    let time = localStorage.getItem('time'); 

    document.getElementById('result').innerHTML = ``;

    if(result.status === 'success'){
        document.getElementById('result').innerHTML += `<h1>It was a <em>${result.status}</em>!!</h1>
                                                        <p>Found Falcone on ${result.planet_name}!!</p>
                                                        <div>Time taken: ${time}</div>
                                                        <div>Best Time : ${localStorage.getItem('timeBest')}</div>
                                                        `;
    }

    else{
        document.getElementById('result').innerHTML += '<h1>Mission <em>Failed</em>!!</h1>';
    }

}

/********************************************************************************/

/*
export {
    getPlanets,
    getVehicles,
    createPlanetList,
    createVehicleList,
    updateVehicleInventory,
    populateTable, 
    updateTime,
    checkReady, 
    checkResult, 
    viewResult
};
*/