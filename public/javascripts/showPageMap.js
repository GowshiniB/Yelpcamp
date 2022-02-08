    mapboxgl.accessToken = mapToken;
    const map = new mapboxgl.Map({
      container: 'map', // container ID
      style: 'mapbox://styles/mapbox/light-v10', // style URL
      center: campground.geometry.coordinates, // starting position [lng, lat]
      zoom: 9 // starting zoom
    });
    map.addControl(new mapboxgl.NavigationControl());
    map.addControl(new mapboxgl.FullscreenControl());
   const marker =  new mapboxgl.Marker() //for marker
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
      new mapboxgl.Popup({offset: 25, closeOnClick: true})
      .setHTML(
        `<h6> ${campground.title} </h6><p>${campground.location}</p>`
      )
    )
    .addTo(map);