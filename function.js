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

function populateLists(planets){
    

    Array.from(document.querySelectorAll('.list > select'))
             .map(node => {
                
                    Object.keys(planets)
                          .forEach(p => node.innerHTML += `<option value="${p}">${p} (${planets[p].distance})</option>\n`);
                
             }); 

        /*
          <div class="list">
            <label>Destination 1</label>
            <select id="0" name="planet0">
              <option selected disabled value="">Select</option>
              <option>Donlon</option>
              <option>Enchai</option>
              <option>Jebing</option>
              <option>Sapir</option>
              <option>Lerbin</option>
              <option>Pingasor</option>
            </select>
          </div>
        */ 
}

function updateLists(chosenP){
    
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

export {
    getPlanets,
    getVehicles,
    populateLists,
    updateLists,
    createVehicleList,
    updateVehicleTable
};