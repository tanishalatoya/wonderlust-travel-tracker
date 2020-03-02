import $ from 'jquery';
//STYLESHEETS
import './css/base.scss';
import './css/styles.scss';
//CLASSES
import Destination from './Destination.js'
import Trip from './Trip.js'
import Traveler from './Traveler.js'
import TravelAgent from './TravelAgent.js'
//IMAGES USED IN THE INDEX
import './images/w-icon.png'
import './images/user.svg'
//DOMUPDATES
import domUpdates from './domUpdates.js'

const travlersData = fetch('https://fe-apps.herokuapp.com/api/v1/travel-tracker/1911/travelers/travelers')
  .then(response => response.json())
  .then(data => data.travelers)
  .catch(error => console.log(error))

const destinationsData = fetch('https://fe-apps.herokuapp.com/api/v1/travel-tracker/1911/destinations/destinations')
  .then(response => response.json())
  .then(data => data.destinations)
  .catch(error => console.log(error))

const tripsData = fetch('https://fe-apps.herokuapp.com/api/v1/travel-tracker/1911/trips/trips')
  .then(response => response.json())
  .then(data => data.trips)
  .catch(error => console.log(error))

let allData, destination, trip, traveler;

$('#sign-in-submit').on('click', signInTraveler);
$('#admin-log-in').on('click', domUpdates.displayAdminLogInScreen);
$('#admin-log-in').on('click', domUpdates.createAdminSignInButton);


$(document).ready(() => {
  Promise.all([travlersData, destinationsData, tripsData])
    .then(data => {
      allData = {}
      allData.travelers = data[0];
      allData.destinations = data[1];
      allData.trips = data[2];
      return allData;
    })
    .then(allDestinations)
    .then(allTrips)
    .then(allTravelers)
})

let allDestinations = () => {
  return allData.destinations.map(destinationData => {
     return destination = new Destination(destinationData)
  });
};

let allTrips = () => {
  return allData.trips.map(tripData => {
    return trip = new Trip(tripData, allData.destinations)
  });
};

let allTravelers = () => {
  return allData.travelers.map(travelersData => {
    return traveler = new Traveler(travelersData, allData.trips)
  });
};

let updateTravelerProperties = () => {
  let updatedTravelers = [];
  allTravelers().forEach(traveler => {
    traveler.getPastTrips();
    updatePastTripProperties(traveler);
    traveler.getPendingTrips();
    updatePendingTripProperties(traveler)
    traveler.getApprovedUpcomingTrips();
    updateUpcomingTripProperties(traveler);
    updatedTravelers.push(traveler)
  });
  return updatedTravelers;
}

let updatePastTripProperties = (user) => {
  let updatedPastTrips = [];
  user.pastTrips.forEach(trip => {
    trip = new Trip(trip, allData.destinations);
    trip.getDestinationName()
    updatedPastTrips.push(trip)
  })
  return user.pastTrips = updatedPastTrips;
}

let updatePendingTripProperties = (user) => {
  let updatedPendingTrips = [];
  user.pendingTrips.forEach(trip => {
    trip = new Trip(trip, allData.destinations);
    trip.getDestinationName()
    updatedPendingTrips.push(trip);
  })
  return user.pendingTrips = updatedPendingTrips;
}

let updateUpcomingTripProperties = (user) => {
  let updatedUpcomingTrips = [];
  user.upcomingTrips.forEach(trip => {
    trip = new Trip(trip, allData.destinations);
    trip.getDestinationName()
    updatedUpcomingTrips.push(trip);
  })
  return user.upcomingTrips = updatedUpcomingTrips;
}

function signInTraveler() {
  let userInput = $('#user').val();
  let passwordInput = $('#password').val();
  let userId = userInput.slice(8);
  let travelers = updateTravelerProperties();
  let currentTraveler;
  if ((typeof parseInt(userInput[8])) === 'number' && passwordInput === 'travel2020') {
    currentTraveler = travelers[userId - 1];
    domUpdates.createHeaderForTravelerDashboard(currentTraveler)
    domUpdates.createTravelerDashboard(currentTraveler)
    domUpdates.insertPastTrips(currentTraveler);
    domUpdates.insertUpcomingTrips(currentTraveler);
    domUpdates.insertPendingTrips(currentTraveler);
  } else {
    alert('Your username or passowrd is not correct.')
  }
}

function signInAdmin() {
    if ($('#user').val() === 'agency' && $('#password').val() === 'travel2020') {
      let agent = new TravelAgent(allData.trips);
      domUpdates.createAgentDashboard(agent);
      domUpdates.createHeaderForAgentDashboard(agent);
    } else {
      alert('Your username or passowrd is not correct.');
    }
  }

//should probably be moved to a DOMupdates.js file
function createDestinationCard() {
  allDestinations().forEach(destination => {
    $('.all-destination-cards').append(`<div id=${destination.id} class="destination">
      <p>${destination.name}</p>
      <img class="destination-img" src="${destination.image}" alt=${destination.alt}>
      <p>Lodging Per Day: $${destination.estimatedLodgingCostPerDay}.00</p>
      <p>Flight Per Person: $${destination.estimatedFlightCostPerPerson}.00</p>
      <button class='trip-booking-btn'>Book This Trip<button>`)
  });
  $('main').css('height', 'auto');
  $('.trip-booking-btn').on('click', displayBookingForm);
}

function displayBookingForm() {
  let destinationID = event.target.parentElement.id;
  let destination = allDestinations()[destinationID - 1];
  $('main').html(`<section>
      <form id="booking-trip-form">
      <p>Book a trip to <span>${destination.name}</span><p>
      <label for="date">Date
        <input id="date" type="date">
      </label>
      <label for="duration"> Duration
        <input id="duration" type="number">
      </label>
      <label for="travelers">Number of Travelers
        <input id="travelers" type="number">
      </label>
      <button id="submit-trip-btn" type="button">Submit Trip</button>
      <button id="cancel-booking" type="button">Cancel</button>
      </form>
      </section>`)
    $('main').css('height', '90vh');
    $('main').append(`<section class="display-trip-cost"></section>`)
    $('#cancel-booking').on('click', domUpdates.displayBookingPage);
    $('input[id="duration"], input[id="travelers"]').on('input', updateTotalCost);
}

function updateTotalCost() {
  let duration = $('#duration').val();
  let travelers = $('#travelers').val();

  $('.display-trip-cost').html(`<p>Total Cost of Lodging For This Trip: ${travelers * duration * 500}</p>
    <p>Total Cost of Flights For This Trip: ${travelers * 500}</p>
    <p>Travel Agent's 10% Fee: ${((travelers *
      duration * 500) + (duration * 500)) * .1}</p>
    <p>Total Cost of this Trip:<p>`)
}

export { signInAdmin, createDestinationCard }
