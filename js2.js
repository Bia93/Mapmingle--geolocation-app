//we are gonna use classes for a better architecture of the code
//for a better structure we use classes
const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");
//let map, mapEvent;
class Workout {
  date = new Date(); //as a field
  //În Interiorul Clasei: Declarația date = new Date(); în interiorul clasei asigură că fiecare instanță a clasei Workout primește o valoare unică pentru data curentă în momentul în care este creată. Aceasta înseamnă că fiecare antrenament (Workout) are propria sa dată specifică.
  //În Exteriorul Clasei: Dacă date ar fi fost definit în afara clasei, toate instanțele clasei Workout ar împărți aceeași valoare pentru date, ceea ce nu ar fi corect în contextul în care fiecare antrenament are loc la momente diferite.
  id = (Date.now() + "").slice(-10); //ant object should have some kinda identifier, so later we can then later identify it using the ID //as a field
  //Date.now() - its giving me the current time stamp of right now
  clicks = 0;
  constructor(coords, distance, duration) {
    this.coords = coords; //[lat,lng]
    this.distance = distance; //in km
    this.duration = duration; //in min
  }
  _setDescription() {
    // we are gonna use it for line _renderWorkout
    //prettier-ignore
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)}on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
    //when a object is created a _setDescription should be set
  }
  click() {
    this.clicks++; //its gonna increase the number of clicks, on the same object
    //every object gets this method and so each of the workouts;we can now increase the number of clicks
  }
}
//we are gonna create the child classes of the workout
class Running extends Workout {
  constructor(coords, distance, duration, cadence) {
    //should take the same data as the parent class plus the additional properties that we want to se on a running object
    super(coords, distance, duration); //By calling the super() method in the constructor method, we call the parent's constructor method and gets access to the parent's properties and methods:
    this.cadence = cadence; //its the unique property that running is having
    this.type = "running";
    this.calcPace(); //we call it in the constructor
    this._setDescription();
  }
  calcPace() {
    //min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.type = "cycling";
    this._setDescription();
    this.calcSpeed();
  }
  calcSpeed() {
    //km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}
//const run1 = new Running([39, -12], 5.2, 24, 178);
//const cycling1 = new Cycling([39, -12], 27, 95, 578);
//console.log(run1, cycling1);
//APPLICATION ARCHITECTURE
class App {
  #map; //this are object properties;both of them will become private instance properties
  #mapZoomLevel = 13;
  #mapEvent;
  #workouts = [];
  constructor() {
    //Get user's position
    this._getPosition(); //i called the function // will get executed immediately as the script loads, because is in global scope
    //Get data from local storage
    this._getLocalStorage();
    //Attach event handlers
    form.addEventListener("submit", this._newWorkout.bind(this)); //this._newWorkout-is an event handler function;so its a function that its gonna pe called by addEventListener
    // this._newWorkout is gonna point to form and no longer to the App object
    //we fix that by using bind
    //its a real pain of working with event handler in classes like we are doing right now;
    //when we have event listener inside of a class, I will be binding the this keywords all the time
    //we need to use the bind(this) to point to the App object
    inputType.addEventListener("change", this._toggleElevationField);
    containerWorkouts.addEventListener("click", this._moveToPupUp.bind(this));
    //pt linia de mai sus: we are gonna do event delegation
    // we are gonna add the event handler to the parent element
    //we are doing this in the constructor so the event listener is added right in the beginning
    //we are gonna create a method this._moveToPupUp and we are gonna put it at the end
    //we use bind(this) -this._moveToPupU is am method is called by the addEventListener method
    //so therefore the "this " keyword from  const workout = this.#workouts.find(
    //(work) => work.id === workoutEl.dataset.id from where we have the _moveToPupU method is not what i want to be,so we put a bind
  }
  _getPosition() {
    if (navigator.geolocation) {
      //daca navigator.geolocation exists, do what is in parenthesis
      //for API - we are going to make 2 function:one when the geo is working and one when it is not working
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        //_loadMap(alone)-is treated as a regular function call, not as a method call
        //since it s a callback function, we are not calling ourselves
        //it is the getCurrentPosition function that we ll call this callbackfunction once that it gets
        //the current position of the user.when its called this method(this._loadMap),its called like a regular function
        //in a regular function, the this keyword is set to undefined
        //the solution  is to manually bind this keyword to whatever we need.in this case is simply, this (points to the current object-_loadMap)
        //bind-this point to the current object ;will simply return a new function
        function () {
          //am facut call back la functia de loadMap prin this
          alert("Unable to determine your location. Please repeat!");
        }
      );
    }
  }
  _loadMap(position) {
    // we are gonna take the lat ang log from inspect, which is in the object coors
    const { latitude } = position.coords; //using destructuring
    const { longitude } = position.coords;

    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
    //map de la index.html; L-gives as an entry point-its a global variable it can be accesed from all the other scripts
    //13- is the zoom on the map
    //tile- the map is made from small tiles that comes from the URL
    // we can change the theme of the URL
    //how to display a map using a third party library called LEAFLET
    this.#map = L.map("map").setView([latitude, longitude], this.#mapZoomLevel); //its like a property that its defined on the object itself
    //console.log(map);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    L.marker([latitude, longitude])
      .addTo(this.#map)
      .bindPopup("Here you are!")
      .openPopup(); //this is for th blue marker-pop up
    //how to add multple pins
    //Handling clicks on map
    console.log(this);
    this.#map.on("click", this._showForm.bind(this));
    //in caz ca nu e clar, voi merge la 238 la johnatan, udemy, minutul 20:00
    this.#workouts.forEach((work) => {
      //#workouts is in array if you look in the code; so we loop throw array
      //we want to do something for each of the workouts, so we loop over the array,but we dont want to create a new array//
      //so we use forEach(), we gonna call each of the work
      //we need show also the render message on the map
      this._renderWorkMarker(work);
      //are leagtura cu incarcarea paginii de aia am pus in load map si nu in _getlocalstorage
    });
  }
  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove("hidden"); // ca sa nu mai fie ascuns tabelul cand dam click pe harta
    inputDistance.focus();
    //map was generated by leaflet ;on care vine de la map (o sa l folosim pe post de eventlistener method)
  }
  _hideForm() {
    //Empty inputs
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        ""; //pt a sterge valorile in tabel in momentul in care dam enter pe tabel
    form.style.display = "none";
    form.classList.add("hidden");
    setTimeout(() => (form.style.display = "grid"), 1000); //Timeout is gonna call a certain callback function after a certain time, pentru tabel
  }
  _toggleElevationField() {
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden"); //we have selected the closes parent throw closest
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
  }
  _newWorkout(e) {
    e.preventDefault(); //The preventDefault() method cancels the event if it is cancelable, meaning that the default action that belongs to the event will not occur.
    //Get data from form
    const type = inputType.value; //they always come as strings, let s convert them to a number
    const distance = Number(inputDistance.value);
    const duration = Number(inputDuration.value);
    const { lat, lng } = this.#mapEvent.latlng; //destructuring
    let workout;
    //If activity running, create running object
    if (type === "running") {
      const cadence = Number(inputCadence.value);
      //Check if data is valid
      //In JavaScript, a finite number is a numeric value that is not NaN (Not a Number), Infinity, or -Infinity. Essentially, it's any real number that is neither infinite nor NaN.
      //if the distance is not a number(we use Number.isFinite),then we want to return it
      if (
        !Number.isFinite(distance) ||
        distance < 0 ||
        !Number.isFinite(duration) ||
        duration < 0 ||
        !Number.isFinite(cadence) ||
        cadence < 0
      )
        return alert("Only positive numbers!");
      workout = new Running([lat, lng], distance, duration, cadence);
    }
    //If activity cycling, create cycling object
    if (type === "cycling") {
      const elevation = Number(inputElevation.value);
      //Check if data is valid
      if (
        !Number.isFinite(distance) ||
        distance < 0 ||
        !Number.isFinite(duration) ||
        duration < 0 ||
        !Number.isFinite(elevation)
      )
        return alert("Only positive numbers");
      workout = new Cycling([lat, lng], distance, duration, elevation); //imi creeaza un obiect nou
    }

    //If activity cycling, create cycling object

    //Add the new object to the workout array
    this.#workouts.push(workout);
    console.log(workout);
    //Render workout on the map as marker
    this._renderWorkMarker(workout); //we need to pass in the workout object, otherwise is not gonna work
    //Render workout on the list
    this._renderWorkout(workout); //we are calling the method
    // Hide form + Clear input fields
    this._hideForm();
    //Set local storage to all workouts
    this._setLocalStorage();
    //console.log(this.#mapEvent);
  }
  _renderWorkMarker(workout) {
    L.marker(workout.coords) // we add this for blue marker-luam de la mapEvent datele(cand dam console.log(mapEvent)-o sa ne apara obiect si deacolo luam datele)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxwidth: 250, //de la documentation leaflet
          minwidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`, // se modifica marginea de culoare
        })
      )
      .setPopupContent(
        `${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"} ${workout.description}` //pt a aparea descrierea pe pin, pe mapa
      )
      .openPopup();
  }
  _renderWorkout(workout) {
    //we are gonna render the data in the table
    //we are gonna create some markup; so basically some HTML and then we will insert that into the DOM whenever is there a new workout
    //we are gonna use template literals for taking the code from html into js
    // we are gonna replace some data ex. ${. }
    let html = `
      <li class="workout workout--${workout.type}" data-id="${workout.id}">
            <h2 class="workout__title">${workout.description}</h2>
            <div class="workout__details">
              <span class="workout__icon">${
                workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️" //we used the turnary operator
              }</span>
              <span class="workout__value">${workout.distance}</span>
              <span class="workout__unit">km</span>
            </div>
            <div class="workout__details">
              <span class="workout__icon">⏱</span>
              <span class="workout__value">${workout.duration}</span>
              <span class="workout__unit">min</span>
            </div>
      `;
    if (workout.type === "running")
      html += `<div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.pace.toFixed(1)}</span>
        <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">${workout.cadence}</span>
        <span class="workout__unit">spm</span>
      </div>
    </li>`;
    if (workout.type === "cycling")
      html += `<div class="workout__details">
    <span class="workout__icon">⚡️</span>
    <span class="workout__value">${workout.speed.toFixed(1)}</span>
    <span class="workout__unit">km/h</span>
  </div>
  <div class="workout__details">
    <span class="workout__icon">⛰</span>
    <span class="workout__value">${workout.elevationGain}</span>
    <span class="workout__unit">m</span>
  </div>
</li>`;
    form.insertAdjacentHTML("afterend", html); //will basically add the new element as a sibling element at the end of the form
  }
  _moveToPupUp(e) {
    //here we are gonna need an event (e),because we are gonna match the object ot actually  the element that we are gonna actually use it.
    const workoutEl = e.target.closest(".workout");
    //we are gonna create the workoutEl and we are gonna look at e.target(its the element that is actually cliked)
    //and then we are gonna look for the closest workout parent ;closest-is the opposite of the query selector
    //console.log(workoutEl);
    //when we do this, the all element is selected and we can make a brisdge between the user interference
    //and the data that we have actually in our app(throw the ID)
    if (!workoutEl) return; //asta ca sa nu ne apara null cand apasam pe langa casuta
    const workout = this.#workouts.find(
      (work) => work.id === workoutEl.dataset.id
    ); //we use find to find an element of the array; we are gonna use callback function : (work) => work.id === workoutEl.dataset.id
    console.log(workout);
    //now we can the coordinates from the id element and then move to map to the position
    //in leaflet, there is actually a method that is available on all map objects
    //we take the map object that we already have and call the setView method
    //we can check the leaflet to know more about the setView()
    //when we enter on the cyclington or runnington,the map will move on the adress where we have the pin; thats why I used the setView()
    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: { duration: 1 },
    });
    //the setView() method needs as a first argument the coordinates,second the zoom level, we can pass in an object of options ;

    //we are doing what is down, to increase the number of clicks
    //we take the object that we already have, the workout and using that public interface
    //using the public interface
    //workout.click();
  }
  _setLocalStorage() {
    localStorage.setItem("workouts", JSON.stringify(this.#workouts));
    //localStorage is a very simple API AND its usually used for small amounts of data
    //that is because local storage is blocking
    //JSON.stringify- to convert  every object in JS to a string
  }
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem("workouts"));
    console.log(data);
    //when is nothing in local storage the data will be undeifined
    if (!data) return;
    //the method_getLocalStorage() is gonna be executed in the very beginning.
    //And so at that point, the workouts array is gonna be empty. But if we already
    //have some data in the local storage then, we will simply set the workouts
    //array to the data that we had before
    this.#workouts = data;
    //we will take all the workouts and render them on the list
    // !!! when we convert from object to string and viceversa we lost the PROTOTYPE CHAIN. so the new
    // object that we recover from the local storage are now just regulat objects( it has to do with the
    //clicks we made that our workout move on the pace) .They are no longer objects that we created by running
    //or by the cycling class. so they will be not able to inherit any of there methods
    //we have to restore the objects
    //we are gonna disable the functionality of counting the clicks
    this.#workouts.forEach((work) => {
      this._renderWorkout(work);
      //#workouts is in array if you look in the code; so we loop throw array
      //we want to do something for each of the workouts, so we loop over the array,but we dont want to create a new array//
      //so we use forEach(), we gonna call each of the work
      //we need show also the render message on the map
    });
  }
  reset() {
    //remove the workouts item from local storage
    localStorage.removeItem("workouts");
    //and now we can then reload the page programmatically and then the application will look completely empty
    location.reload();
    //location-is a big object that contains a lot of methods and properties in the browser
  }
}
const app = new App(); //we made an instance
//The line const app = new App(); is necessary because it creates an instance of the App class and initializes the application. In object-oriented programming, classes serve as blueprints for creating objects. When you define a class, you're essentially defining a new type of object with its own properties and methods.
//However, simply defining a class doesn't automatically create an object. You need to explicitly create an instance of the class using the new keyword followed by the class name and parentheses (). This instantiation process calls the class constructor, which typically initializes the object's properties and sets up any necessary functionality.
//In this case, const app = new App(); creates an instance of the App class and assigns it to the variable app. This instance represents the running application and allows you to interact with its methods and properties. Without this line, the App class would be defined but not actually used, so the application wouldn't be initialized or executed.
