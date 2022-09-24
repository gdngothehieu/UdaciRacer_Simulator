// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
const store = {
  track_id: undefined,
  player_id: undefined,
  race_id: undefined,
  track: undefined,
};

const updateStore = (newState) => {
  Object.assign(store, newState);
};

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  onPageLoad();
  setupClickHandlers();
});

const onPageLoad = async () => {
  // fetch tracks and racer data and render cards accordingly
  try {
    getTracks().then((tracks) => {
      const html = renderTrackCards(tracks);
      renderAt("#tracks", html);
    });

    getRacers().then((racers) => {
      const html = renderRacerCars(racers);
      renderAt("#racers", html);
    });
  } catch (error) {
    console.error(error);
  }
};

const setupClickHandlers = () => {
  document.addEventListener(
    "click",
    (event) => {
      const { target } = event;

      // Race track form field
      if (target.matches(".card_track")) {
        handleSelectTrack(target);
      }

      // Podracer form field
      if (target.matches(".card_racer")) {
        handleSelectPodRacer(target);
      }

      // Submit create race form
      if (target.matches("#submit-create-race")) {
        event.preventDefault();
        // start race
        handleCreateRace();
      }

      // Handle acceleration click
      if (target.matches("#gas-peddle")) {
        handleAccelerate(target);
      }
    },
    false
  );
};

const delay = async (ms) => {
  try {
    return await new Promise((resolve) => setTimeout(resolve, ms));
  } catch (error) {
    console.error(error);
  }
};

// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async const controls the flow of the race, add the logic and error handling
const handleCreateRace = async () => {
  // TODO - Get player_id and track_id from the store

  const { player_id } = store;
  const { track_id } = store;

  try {
    // const race = TODO - invoke the API call to create the race, then save the result

    const race = await createRace(player_id, track_id);
    // render starting UI
    renderAt("#race", renderRaceStartView(race.Track));
    // TODO - update the store with the race id

    updateStore({ race_id: race.ID });

    // The race has been created, now start the countdown
    // TODO - call the async function runCountdown

    await runCountdown();
    // TODO - call the async function startRace

    await startRace(race.ID);
    // TODO - call the async function runRace

    await runRace(race.ID);
  } catch (err) {
    console.error(err);
  }
};

const runRace = async (raceID) => {
  return new Promise((resolve, reject) => {
    const raceInterval = setInterval(async () => {
      // TODO - use Javascript's built in setInterval method to get race info every 500ms
      try {
        const getRaceData = await getRace(raceID);
        if (getRaceData.status === "in-progress") {
          /* 
		TODO - if the race info status property is "in-progress", update the leaderboard by calling:

	*/
          renderAt("#leaderBoard", raceProgress(getRaceData.positions));
          const progresses = getProgresses(getRaceData.positions);
        } else if (getRaceData.status === "finished") {
          /* 
		TODO - if the race info status property is "finished", run the following:

	*/
          clearInterval(raceInterval);
          renderAt("#race", resultsView(getRaceData.positions));
          resolve(getRaceData); // resolve the promise
        }
      } catch (e) {
        // remember to add error handling for the Promise

        console.log(e);
        reject();
      }
    }, 500);
  });
};

const runCountdown = async () => {
  try {
    // wait for the DOM to load
    await delay(1000);
    let countdown = 3;

    return new Promise((resolve) => {
      // TODO - use Javascript's built in setInterval method to count down once per second

      const timer = setInterval(() => {
        // run this DOM manipulation to decrement the countdown for the user
        document.getElementById("big-numbers").innerHTML = String(--countdown);
        // TODO - if the countdown is done, clear the interval, resolve the promise, and return

        if (countdown === 0) {
          clearInterval(timer);
          resolve();
        }
      }, 1000);
    });
  } catch (error) {
    console.error(error);
  }
};

const handleSelectPodRacer = (target) => {
  const selectedRacerId = target.id;

  // remove class selected from all racer options
  const selected = document.querySelector("#racers .selected");
  if (selected) {
    selected.classList.remove("selected");
  }

  // add class selected to current target
  target.classList.add("selected");
  // TODO - save the selected racer to the store

  updateStore({ player_id: selectedRacerId });
  toggleStartRaceButton();
};

const handleSelectTrack = (target) => {
  const selectedTrackId = target.id;

  // remove class selected from all track options
  const selected = document.querySelector("#tracks .selected");
  if (selected) {
    selected.classList.remove("selected");
  }
  // add class selected to current target

  target.classList.add("selected");
  // TODO - save the selected track id to the store

  updateStore({ track_id: selectedTrackId });
  toggleStartRaceButton();
};

const handleAccelerate = () => {
  const { race_id } = store;
  // TODO - Invoke the API call to accelerate

  accelerate(race_id);
};

const getProgresses = (positions) => {
  const progresses = positions.map((position) => {
    return {
      progress: Math.round((parseInt(position.segment) / 201).toFixed(2) * 100),
      racer: position.driver_name.replace(" (you)", ""),
      id: position.id,
    };
  });
  return progresses;
};

const toggleStartRaceButton = () => {
  const submitButton = document.getElementById("submit-create-race");
  const { player_id, track_id } = store;
  if (player_id && track_id) {
    submitButton.disabled = false;
  } else {
    submitButton.disabled = true;
  }
};

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

const renderRacerCars = (racers) => {
  if (!racers.length) {
    return ` <h4>Loading Racers...</4> `;
  }
  const results = racers.map(renderRacerCard).join("");
  return ` <ul id="racers"> ${results} </ul>`;
};

const renderRacerCard = (racer) => {
  const { id, driver_name, top_speed, acceleration, handling } = racer;
  return ` <li class="card_racer" id="${id}" 
                 <div class="card__overlay">
			<h3>${driver_name}</h3>
			<p>Speed: ${top_speed}</p>
			<p>Acceleration: ${acceleration}</p>
			<p>Handling: ${handling}</p>
			</div>
		    </li> `;
};

const renderTrackCards = (tracks) => {
  if (!tracks.length) {
    return ` <h4>Loading Tracks...</4> `;
  }
  const results = tracks
    .map((track, index) => renderTrackCard(track, index))
    .join("");
  return ` <ul id="tracks">${results} </ul>`;
};

const renderTrackCard = (track, i) => {
  const { id, name } = track;
  return ` <li id=${id} class="card_track" 
                >
                <div class="card__overlay" style="color:black;"> <h3>${name}</h3></div>
  </li>`;
};

const renderCountdown = (count) => {
  return ` <h2>Race Starts In...</h2> <p id="big-numbers">${count}</p> `;
};

const renderRaceStartView = (track) => {
  return `
		<header>
			<h1 style="color:black">Race:${track.name}</h1>
		</header>
		
		<main id="progress_main">
      <div>
      

      <section id="instructions">
      <h2>Directions</h2>
      <p>Click the button as fast as you can to make your racer go faster!</p>
    </section>
      </div>
      <div>
      <section id="raceUpdates">
            <div style="display:flex;">
                <section id="accelerate">
                    <button id="gas-peddle">Click Me!</button>
                </section>
                
                <section id="leaderBoard">
                    ${renderCountdown(3)}
                </section>
            </div>
      </div>
		</main>
		<footer>
    </footer>
	`;
};

const resultsView = (positions) => {
  positions.sort((a, b) => (a.final_position > b.final_position ? 1 : -1));
  return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main id="results">
			${raceProgress(positions)}
			<a class="button" href="/race">Start a new Race</a>
		</main>
		<footer>
         </footer>
	`;
};

const raceProgress = (positions) => {
  const userPlayer = positions.find((e) => e.id == store.player_id);
  userPlayer.driver_name += " (you)";

  positions = positions.sort((a, b) => (a.segment > b.segment ? -1 : 1));
  let count = 1;

  const results = positions
    .map((p) => {
      return `  <p>${count++} - ${p.driver_name}</p> `;
    })
    .join(" ");
  return `  <h3>Leaderboard</h3> <section id="leaderBoard__positions" style="color:"black"> ${results} </section>  `;
};

const renderAt = (element, html) => {
  const node = document.querySelector(element);
  node.innerHTML = html;
};

// ^ Provided code ^ do not remove

// API CALLS ------------------------------------------------
const SERVER = "http://localhost:8000";

const defaultFetchOpts = () => {
  return {
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": SERVER,
    },
  };
};
// TODO - Make a fetch call (with error handling!) to each of the following API endpoints

const getTracks = async () => {
  // GET request to `${SERVER}/api/tracks`
  try {
    let tracksDataResponse = await fetch(`${SERVER}/api/tracks`);
    tracksDataResponse = await tracksDataResponse.json();
    return tracksDataResponse;
  } catch (e) {
    console.log(e);
  }
};

const getRacers = async () => {
  try {
    let carsDataResponse = await fetch(`${SERVER}/api/cars`);
    carsDataResponse = await carsDataResponse.json();
    return carsDataResponse;
  } catch (e) {
    console.log(e);
  }
};

const createRace = async (player_id, track_id) => {
  try {
    player_id = parseInt(player_id);
    track_id = parseInt(track_id);
    const body = { player_id, track_id };
    let racesDataResponse = await fetch(`${SERVER}/api/races`, {
      method: "POST",
      ...defaultFetchOpts(),
      dataType: "jsonp",
      body: JSON.stringify(body),
    });
    racesDataResponse = await racesDataResponse.json();
    return racesDataResponse;
  } catch (e) {
    console.log(e);
  }
};

const getRace = async (id) => {
  try {
    let raceDataResponse = await fetch(`${SERVER}/api/races/${id - 1}`);
    raceDataResponse = await raceDataResponse.json();

    return raceDataResponse;
  } catch (e) {
    console.log(e);
  }
};

const startRace = async (id) => {
  try {
    let raceDataResponse = await fetch(`${SERVER}/api/races/${id - 1}/start`, {
      method: "POST",
      ...defaultFetchOpts(),
    });
    return raceDataResponse;
  } catch (e) {
    console.log(e);
  }
};

const accelerate = async (id) => {
  try {
    let raceDataResponse = await fetch(
      `${SERVER}/api/races/${id - 1}/accelerate`,
      {
        method: "POST",
        ...defaultFetchOpts(),
      }
    );
    return raceDataResponse;
  } catch (e) {
    console.log(e);
  }
};
