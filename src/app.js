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
        fetch(`https://api.winnipegtransit.com/v3/stops/${stop.key}/schedule.json?max-results-per-route=2&api-key=daPa_bqWLDUioW-C3Jr6`)
        .then(response => response.json())
      )

      Promise.all(stopsData)
      .then(data => {
        data.forEach(currentData => {
          let schedule = currentData['stop-schedule'].stop;
          let routeSchedules = currentData['stop-schedule']['route-schedules'];
          routeSchedules.forEach(currentData => {
            let stops = currentData['scheduled-stops'];
            stops.forEach(stop => {
			        createBusStops(schedule.street.name, schedule['cross-street']['name'], schedule.direction, currentData['route']['key'], stop.times.arrival.scheduled);
		      	})
          })
        })
      })
    })
  })
};

function createStreets(name, key) {
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