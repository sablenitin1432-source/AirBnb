mapboxgl.accessToken = mapToken;
mapboxgl.accessToken = mapToken

const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: "mapbox://styles/mapbox/streets-v12", // style URL
    center: JSON.parse(coordinates), // starting position [lng, lat]
    zoom: 9 // starting zoom
});


const marker1 = new mapboxgl.Marker({ color: "red" })
    .setLngLat(JSON.parse(coordinates)) //Listing.geometry.coordinates
    .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h4>${listingTitle}</h4><p>Exact location provided after booking</p>`

    ))
    .addTo(map);