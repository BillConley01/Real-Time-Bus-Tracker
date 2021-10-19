mapboxgl.accessToken = 'pk.eyJ1IjoiY29ubGV5d2lsbGlhbTAwMSIsImEiOiJja3VzdzFrY28zbmFvMm9vZmkwNzgyYWcxIn0.mjgxTjNrcX-MbJEsLxoenQ';

//global variable to allow setting the routes to view on the map
let currentRouteID = '';
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
function getRouteID(){

    return document.getElementById("select-element").value;
}
function getURL(){
    let routeID = getRouteID();
    return 
}

// Request bus data from MBTA
async function getBusLocations(){
    //let routeID = document.getElementById("select-element").value;
    let url = "https://api-v3.mbta.com/vehicles?filter[route]=" + getRouteID();
    const response = await fetch(url);
    const json     = await response.json();
    return json.data;
}

// Request alert data from MBTA
async function getAlerts(){
    //let routeID = document.getElementById("select-element").value;
    let    url = "https://api-v3.mbta.com/alerts?filter[route]=" + getRouteID();
    const response = await fetch(url);
    const json     = await response.json();
    return json.data;
}

// Display alerts
async function displayAlerts(){
    const routeAlerts = await getAlerts();
    
    //let banner = document.getElementById("alert");
    if (routeAlerts !== null && routeAlerts !== undefined) 
    {
        let msg = "";
        for (let i = 0; i < routeAlerts.length; i++) 
        {
            msg  += `${routeAlerts[i].attributes.header}       `;
        }
        setAlertBanner(msg);
    }
}

async function setAlertBanner(msg){
    let characterCount = await msg.length;    
    let bannerWidth = characterCount*(7.9) 
    let duration = bannerWidth/40;
    let banner = document.getElementById("alert");
    banner.style.display="block";
    banner.style.width= characterCount*(7.8) + "px";
    banner.style.animation = `slide linear ${duration}s infinite`;
    banner.innerHTML=  `${msg}`;
    console.log("Characters " + characterCount + " Width " + banner.offsetWidth + " Duration" + duration);
    return banner;
}

async function displayMarkers(){
    // get bus data
   const locations = await getBusLocations();

   let routeID = getRouteID();
   
    //deleting old markers when route is changed
   if (routeID !== currentRouteID && markers.length >0){
    markers.forEach(element => element.remove());
    markers.splice(0,markers.length);
   }
    // loop will only run if locations has been defined
    if(locations !== null && locations !== undefined){
        //#2 added for loop to run function to add markers
        for (let i = 0; i < locations.length; i++){
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
        currentRouteID =  routeID;
    }
}

async function runAlerts(){

    displayAlerts();
   // timer
   setTimeout(runAlerts, 120000);
}
async function runMarkers(){
   
    displayMarkers();
   // timer
   setTimeout(runMarkers, 15000);
}

async function upDate(){
    runMarkers();
    runAlerts();
}

runMarkers();
runAlerts();

    
