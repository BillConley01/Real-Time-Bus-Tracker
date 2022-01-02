mapboxgl.accessToken = 'pk.eyJ1IjoiY29ubGV5d2lsbGlhbTAwMSIsImEiOiJja3VzdzFrY28zbmFvMm9vZmkwNzgyYWcxIn0.mjgxTjNrcX-MbJEsLxoenQ';

//global variable to allow setting the routes to view on the map
let currentRouteID = '';
//global map variable to display Boston
const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-71.131663,42.352152],
        zoom: 12
});
map.addControl(new mapboxgl.NavigationControl());
//global variable to track markers 
const markers = [];
// a color object for customizing markers
const customColor = {
    Orange: "#FF7F50",
    Blue: "#1E90FF",
    Red: "#DC143C",
    Default: "#9932CC"
}
const selectRouteID = () => {
    return document.getElementById("select-element").value;
}

// Request bus data from MBTA
const getBusLocations = async () => {
    let url = "https://api-v3.mbta.com/vehicles?filter[route]=" + selectRouteID();
    let response = await fetch(url);
    let json = await response.json();
    return json.data;
}

// Request alert data from MBTA
const getAlerts = async () => {
    let url = "https://api-v3.mbta.com/alerts?filter[route]=" + selectRouteID();
    let response = await fetch(url);
    console.log(`response: ${response.length}`);
    let json = await response.json();
    return json.data; 
}
// Display markers
const setMarkers = async () => {
    // get bus data
   let locations = await getBusLocations();
   let routeID = selectRouteID();
   
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
const runMarkers = async () => { 
    setMarkers();
   // timer
   setTimeout(runMarkers, 15000);
}
// Display alerts
const setAlertBanner = async (msg) => {
    let characterCount = await msg.length; 
   
    if(characterCount != 0)  {
    let bannerWidth = characterCount*(7.9) 
    let duration = bannerWidth/40;
    let banner = document.getElementById("alert");
    banner.style.display="block";
    banner.style.width= bannerWidth + "px";
    banner.style.animation = `slide linear ${duration}s infinite`;
    banner.innerHTML=  `${msg}`;
    }else 
    {
        let banner = document.getElementById("alert");
        banner.style.display="none";
        banner.innerHTML=  "";
    }
    return banner;
}
const setAlerts = async () => {
    const routeAlerts = await getAlerts();
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
const runAlerts = async () => {
    setAlerts();
   // timer
   setTimeout(runAlerts, 120000);
}
const upDate = async () => {
    runMarkers();
    runAlerts();
}

//call for alert and markers
upDate();

    
