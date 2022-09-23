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
  const { player_id } = store;
  const { track_id } = store;

  try {
    const race = await createRace(player_id, track_id);
    // render starting UI
    renderAt("#race", renderRaceStartView(race.Track));
    updateStore({ race_id: race.ID });

    // The race has been created, now start the countdown
    await runCountdown();
    await startRace(race.ID);
    await runRace(race.ID);
  } catch (err) {
    console.error(err);
  }
};

const runRace = async (raceID) => {
  return new Promise((resolve, reject) => {
    const raceInterval = setInterval(() => {
      getRace(raceID)
        .then((res) => {
          if (res.status === "in-progress") {
            renderAt("#leaderBoard", raceProgress(res.positions));
            const progresses = getProgresses(res.positions);
            renderAt("#raceProgress", renderProgresses(progresses));
          } else if (res.status === "finished") {
            clearInterval(raceInterval); // to stop the interval from repeating
            renderAt("#race", resultsView(res.positions)); // to render the results view
            resolve(res); // resolve the promise
          }
        })
        .catch((err) => {
          console.error(err);
          reject();
        });
    }, 500);
  });
};

const runCountdown = async () => {
  try {
    // wait for the DOM to load
    await delay(1000);
    let countdown = 3;

    return new Promise((resolve) => {
      const timer = setInterval(() => {
        // run this DOM manipulation to decrement the countdown for the user
        document.getElementById("big-numbers").innerHTML = String(--countdown);
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

  target.classList.add("selected");
  updateStore({ track_id: selectedTrackId });
  toggleStartRaceButton();
};

const handleAccelerate = () => {
  const { race_id } = store;
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
                 style="background-image: url('../assets/images/${driver_name}.png');background-size: cover">
                 <div class="card__overlay">
			<h3>${driver_name}</h3>
			<p>speed: ${top_speed}</p>
			<p>acceleration: ${acceleration}</p>
			<p>handling: ${handling}</p>
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
  return ` <li id=${id} class="card_track" style="background-image: url('../assets/images/${
    i + 1
  }.png');background-size: cover"
                >
                <div class="card__overlay"> <h3>${name}</h3></div>
  </li>`;
};

const renderCountdown = (count) => {
  return ` <h2>Race Starts In...</h2> <p id="big-numbers">${count}</p> `;
};

const renderRaceStartView = (track) => {
  return `
		<header>
			<h1>Race:${track.name}</h1>
		</header>
		
		<main id="progressMain">
            <section id="instructions">
                <h2>Directions</h2>
                <p>Click the button as fast as you can to make your racer go faster!</p>
            </section>
            <section id="raceUpdates">
            <div>
                <section id="accelerate">
                    <button id="gas-peddle">Click Me!</button>
                </section>
                
                <section id="leaderBoard">
                    ${renderCountdown(3)}
                </section>
            </div>
            <div>
                <section id="raceProgress">
                </section>
            </div>
            </section>
		</main>
		<footer>
        <p>Designed and created by Benedikt Michel. Based on starter code provided by Udacity.</p>
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
            <p>Designed and created by Benedikt Michel. Based on starter code provided by Udacity.</p>
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
  return `  <h3>Leaderboard</h3> <section id="leaderBoard__positions"> ${results} </section>  `;
};

const renderAt = (element, html) => {
  const node = document.querySelector(element);
  node.innerHTML = html;
};

// ^ Provided code ^ do not remove

const renderProgresses = (progresses) => {
  const progressBars = progresses
    .map((progress) => {
      return `
                <div class="progressBar" style="left: ${
                  progress.progress - 2
                }%; background-image:  url('../assets/images/${
        progress.racer
      }.png')">           
                </div>
            `;
    })
    .join(" ");
  return ` <div class="progressContainer">  ${progressBars} </div> `;
};

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

const getTracks = () => {
  const tracks = fetch(`${SERVER}/api/tracks`)
    .then((res) => res.json())
    .catch((err) => console.error("Problem with fetching tracks::", err));
  return tracks;
};

const getRacers = () => {
  const cars = fetch(`${SERVER}/api/cars`)
    .then((res) => res.json())
    .catch((err) => console.error("Problem with fetching cars::", err));
  return cars;
};

const createRace = (player_id, track_id) => {
  // create new race with selected racer and track id combination
  // returns {ID: 8, Track: {id: 1, name: "Track 1",…}, PlayerID: 4,…}
  // !!! bug, stored race is available via races/id - 1, in this case /7
  player_id = parseInt(player_id);
  track_id = parseInt(track_id);
  const body = { player_id, track_id };

  return fetch(`${SERVER}/api/races`, {
    method: "POST",
    ...defaultFetchOpts(),
    dataType: "jsonp",
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .catch((err) => console.error("Problem with createRace request::", err));
};

const getRace = (id) => {
  id = id - 1; // bug in API!
  const race = fetch(`${SERVER}/api/races/${id}`)
    .then((res) => res.json())
    .catch((err) => console.error("Problem with get race request::", err));
  return race;
};

const startRace = (id) => {
  id = id - 1; // bug in API!
  return fetch(`${SERVER}/api/races/${id}/start`, {
    method: "POST",
    ...defaultFetchOpts(),
  })
    .then(() => "")
    .catch((err) => console.error("Problem with startRace request::", err));
};

const accelerate = (id) => {
  id = id - 1; // bug in API!
  return fetch(`${SERVER}/api/races/${id}/accelerate`, {
    method: "POST",
    ...defaultFetchOpts(),
  })
    .then(() => "")
    .catch((err) => console.error("Problem with accelerate request::", err));
};
