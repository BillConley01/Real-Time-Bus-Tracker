mapboxgl.accessToken = 'pk.eyJ1IjoiY29ubGV5d2lsbGlhbTAwMSIsImEiOiJja3VzdzFrY28zbmFvMm9vZmkwNzgyYWcxIn0.mjgxTjNrcX-MbJEsLxoenQ';

//gloabl variable to allow setting the routes to view on the map
let routeID = document.getElementById("select-element").value;
let    url = "https://api-v3.mbta.com/vehicles?filter[route]="+ routeID;

//global map variable to display Boston
let map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-71.131663,42.352152],
        zoom: 12
    });

//global variable to track reatedmarkers 
let markers = [];

// a color object for customizing markers
const customColor = {
    Orange: "#FF7F50",
    Blue: "#1E90FF",
    Red: "#DC143C",
    Default: "#9932CC"
}

// Request bus data from MBTA
async function getBusLocations(){
    let routeID = document.getElementById("select-element").value;
    let    url = "https://api-v3.mbta.com/vehicles?filter[route]="+ routeID;
    const response = await fetch(url);
    const json     = await response.json();
    return json.data;
}

// Request alert data from MBTA
async function getAlerts(){
    let routeID = document.getElementById("select-element").value;
    let    url = "https://api-v3.mbta.com/alerts?filter[route]="+ routeID;
    const response = await fetch(url);
    const json     = await response.json();
    return json.data;
}

// Display alerts
async function displayAlerts(){
    const routeAlerts = await getAlerts();
    
    let banner = document.getElementById("alert");
    if (routeAlerts.length !== null && routeAlerts.length !== null) 
    {
        let msg = "";
        for(let i = 0; i < routeAlerts.length; i++) 
        {
            msg  += `${routeAlerts[i].attributes.header}       `;
        }
        banner.innerHTML=  `${msg}`;
        banner.style.display="block";
    } 
    else banner.style.display = "none";
}   

//Update or Display markers
async function upDateMarkers(){
    // get bus data
   const locations = await getBusLocations();
  
    //deleting old markers when route is changed
   if (markers.length > 0){
    markers.forEach(element => element.remove());
    markers.splice(0,markers.length);

   }
    // loop will only run if locations has been defined
    if(locations.length !== null){
        //#2 added for loop to run function to add markers
        for(let i = 0; i < locations.length; i++){
            
            // variables for marker lat and long
            let latitude = locations[i].attributes.latitude;
            let longitude = locations[i].attributes.longitude;
            
            // variables to add to pop up messages
            let currentStatus = locations[i].attributes.current_status;
            currentStatus = currentStatus.toLowerCase();
            currentStatus = currentStatus.replaceAll('_', ' ');
            let msg = `Route ${locations[i].relationships.route.data.id} Bus ${locations[i].attributes.label} ${currentStatus} Stop ${locations[i].attributes.current_stop_sequence}`;
           
            //setting default color
            let markerColor = customColor.Default;
            
            //setting marker color variable based on route
            if(locations[i].relationships.route.data.id ==="Orange"){
                markerColor = customColor.Orange;
            }
            else if(locations[i].relationships.route.data.id ==="Blue"){
                markerColor = customColor.Blue;
            }
            else if(locations[i].relationships.route.data.id ==="Red"){
                markerColor = customColor.Red;
            }
            else {
                markerColor = customColor.Default;
            }
            
            //creating marker with custom color
            let marker = new mapboxgl.Marker({color: markerColor});
           
            //adding marker to array 
            markers.push(marker);
           
            //setting marker array element attributes
            markers[i].setLngLat([longitude,latitude]);
            markers[i].setPopup(new mapboxgl.Popup().setText(msg));
            markers[i].addTo(map);
        }
    }
}

async function run(){
        upDateMarkers();
        displayAlerts();
        // timer
        setTimeout(run, 15000);
}

run();

    
