//we are gonna use classes for a better architecture of the code
//for a better structure we use classes
const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--distance");
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
  constructor(coords, distance, duration) {
    this.coords = coords; //[lat,lng]
    this.distance = distance; //in km
    this.duration = duration; //in min
  }
}
//we are gonna create the child classes of the workout
class Running extends Workout {
  constructor(coords, distance, duration, cadence) {
    //should take the same data as the parent class plus the additional properties that we want to se on a running object
    super(coords, distance, duration); //By calling the super() method in the constructor method, we call the parent's constructor method and gets access to the parent's properties and methods:
    this.cadence = cadence; //its the unique property that running is having
    this.calcPace(); //we call it in the constructor
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
  #map; //both of them will become private instance properties
  #mapEvent;
  constructor() {
    this._getPosition(); //i called the function // will get executed immediately as the script loads, because is in global scope
    form.addEventListener("submit", this._newWorkout.bind(this)); //this._newWorkout-is an event handler function;so its a function that its gonna pe called by addEventListener
    // this._newWorkout is gonna point to form and no longer to the App object
    //we fix that by using bind
    //its a real pain of working with event handler in classes like we are doing right now;
    //when we have event listener inside of a class, I will be binding the this keywords all the time
    //we need to use the bind(this) to point to the App object
    inputType.addEventListener("change", this._toggleElevationField);
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
    this.#map = L.map("map").setView([latitude, longitude], 13); //its like a property that its defined on the object itself
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
  }
  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove("hidden"); // ca sa nu mai fie ascuns tabelul cand dam click pe harta
    inputDistance.focus();
    //map was generated by leaflet ;on care vine de la map (o sa l folosim pe post de eventlistener method)
  }
  _toggleElevationField() {
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden"); //we have selected the closes parent throw closest
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
  }
  _newWorkout(e) {
    e.preventDefault();
    //console.log(this);
    //Clear input fields
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        ""; //pt a sterge valorile in tabel in momentul in care dam enter pe tabel
    //Display marker
    //console.log(this.#mapEvent);
    const { lat, lng } = this.#mapEvent.latlng; //destructuring
    L.marker([lat, lng]) //we add this for blue marker-luam de la mapEvent datele(cand dam console.log(mapEvent)-o sa ne apara obiect si deacolo luam datele)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxwidth: 250, //de la documentation leaflet
          minwidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: "running-popup",
        })
      )
      .setPopupContent("Workout")
      .openPopup();
  }
}
const app = new App(); //we made an instance
//The line const app = new App(); is necessary because it creates an instance of the App class and initializes the application. In object-oriented programming, classes serve as blueprints for creating objects. When you define a class, you're essentially defining a new type of object with its own properties and methods.
//However, simply defining a class doesn't automatically create an object. You need to explicitly create an instance of the class using the new keyword followed by the class name and parentheses (). This instantiation process calls the class constructor, which typically initializes the object's properties and sets up any necessary functionality.
//In this case, const app = new App(); creates an instance of the App class and assigns it to the variable app. This instance represents the running application and allows you to interact with its methods and properties. Without this line, the App class would be defined but not actually used, so the application wouldn't be initialized or executed.
