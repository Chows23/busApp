const streetListElement = document.querySelector('.streets');
const streetName = document.querySelector('#street-name');
const input = document.querySelector('input');
const search = document.querySelector('form');
const table = document.querySelector('tbody');

function getStreet(street) {
  fetch(`https://api.winnipegtransit.com/v3/streets.json?api-key=daPa_bqWLDUioW-C3Jr6&name=${street}`)
  .then(response => {
    response.json().then(data => {
      if (data.streets.length === 0) {
        streetListElement.insertAdjacentHTML('beforeend',
          `<div>no results were found</div>`)
      } else {
		    data.streets.forEach(street => {
			    createStreets(street.name, street.key);
		    })
	    } 
    })
  })
};

function getStop(key) {
  fetch(`https://api.winnipegtransit.com/v3/stops.json?api-key=daPa_bqWLDUioW-C3Jr6&street=${key}`)
  .then(response => {
    response.json().then(data => {
      let stopsData = data.stops.map(stop =>
        fetch(`https://api.winnipegtransit.com/v3/stops/${stop.key}/schedule.json?api-key=daPa_bqWLDUioW-C3Jr6&max-results-per-route=2`)
        .then(response => response.json())
      )

      Promise.all(stopsData).then(data => {
        data.forEach(item => {
          let schedule = item['stop-schedule'].stop;
          let name = schedule.street.name;
          let crossStreet = schedule['cross-street']['name'];
          let direction = schedule.direction;
          let routeSchedules = item['stop-schedule']['route-schedules'];
          routeSchedules.forEach(item => {
            let busNumber = item['route']['key'];
            let stops = item['scheduled-stops'];
            stops.forEach(stop => {
			        createBusStops(name, crossStreet, direction, busNumber, stop.times.arrival.scheduled);
		      	})
          })
        })
      })
    })
  })
};

function createStreets(name, key){
  streetListElement.insertAdjacentHTML('beforeend',
    `<a href="#" data-street-key="${key}">${name}</a>`
  );
};

function createBusStops(name, crossStreet, direction, busNumber, arriveTime) {
  table.insertAdjacentHTML('beforeend',
  `
  <tr>
    <td>${name}</td>
    <td>${crossStreet}</td>
    <td>${direction}</td>
    <td>${busNumber}</td>
    <td>${arriveTime}</td>
  </tr>
  `);
};

search.addEventListener('submit', function(e) {
  e.preventDefault();
  streetListElement.innerHTML = '';
  getStreet(input.value);
  input.value = '';
});

streetListElement.addEventListener('click', e => {
  if (e.target.tagName === 'A') {
    table.innerHTML = '';
    streetName.innerHTML = '';
    const key = e.target.getAttribute('data-street-key');
    streetName.innerHTML = `Displaying results for ${e.target.innerHTML}`;
    getStop(key);
  }
});