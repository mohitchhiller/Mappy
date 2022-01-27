'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
  date = new Date();
  id = (Date.now() + ' ').slice(-10);
  constructor(cords, distance, duration) {
    this.cords = cords;
    this.distance = distance;
    this.duration = duration;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(cords, distance, duration, elevationGain) {
    super(cords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }
  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
  }
}
class Running extends Workout {
  type = 'running';
  constructor(cords, distance, duration, cadence) {
    super(cords, distance, duration);
    this.cadence = cadence;
  }
  calcPace() {
    this.pace = this.duration / this.distance;
  }
}

// const run1 = new Running([26, 77], 120, 30, 255);
// console.log(run1);
class App {
  #map;
  #mapEvent;
  Workout = [];
  constructor() {
    this._getPosition();

    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevation);
  }
  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          console.log('no coords');
        }
      );
    }
  }
  _loadMap(pos) {
    const { latitude, longitude } = pos.coords;
    const cords = [latitude, longitude];
    this.#map = L.map('map').setView(cords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    this.#map.on('click', this._showForm.bind(this));
  }
  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _toggleElevation() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }
  _newWorkout(e) {
    const valid = (...values) => values.every(val => Number.isFinite(val));
    const isPositive = (...values) => values.every(val => val > 0);
    e.preventDefault();
    //Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    const cords = [lat, lng];
    let workout;
    //Check if data is valid

    //If activity running , create running object ,\
    if (type === 'running') {
      const cadence = +inputCadence.value;
      //Check if data is valid
      if (
        !valid(distance, duration, cadence) ||
        !isPositive(distance, duration, cadence)
      ) {
        console.log(valid);
        return alert('this is not a valid input');
      }
      workout = new Running(cords, distance, duration, cadence);
    }
    // If activity cycling , create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      if (
        !valid(distance, duration, elevation) ||
        !isPositive(distance, duration)
      ) {
        return alert('this is not a valid input');
      }
      workout = new Cycling(cords, distance, duration, elevation);
    }
    //Add new object to workout array
    this.Workout.push(workout);

    //Render workout on map as marker
    const marker = workout => {
      L.marker([lat, lng])
        .addTo(this.#map)
        .bindPopup(
          L.popup({
            maxWidth: 150,
            autoClose: false,
            closeOnClick: false,
            className: 'running-popup',
          })
        )
        .setPopupContent('poppy')
        .openPopup();
    };

    // Render workout on list

    // Hide form + clear input fields
    const formClear = () => {
      form.classList.add('hidden');
      inputElevation.value =
        inputCadence.value =
        inputDuration.value =
        inputDistance.value =
          '';
    };
    formClear();
  }
}
const newApp = new App();
