"use strict";


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */
const noImage = "http://tinyurl.com/missing-tv";

async function getShowsByTerm(term) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
let response = await axios.get(`http://api.tvmaze.com/search/shows?q=${term}`);
let shows = response.data.map(result => {
  let show = result.show;
  return {
    id: show.id,
    name: show.name,
    summary: show.summary,
    image: show.image ? show.image.medium : noImage,
  };
 });
return shows;
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  const $showsList = $("#shows-list");
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}">
      <div class="card" data-show-id="${show.id}">
        <img class="card-img-top" src="${show.image}">
        <div class="card-body">
          <h5 class="card-title">${show.name}</h5>
          <p class="card-text">${show.summary}</p>
          <button class="btn btn-primary get-episodes">Episodes</button>
        </div>
      </div>  
    </div>
   `);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */
const $searchForm = $("#search-form");
$('#search-form').on('submit', async function searchForShowAndDisplay(event) {
  event.preventDefault();

  // had to change the id here that was given
  const term = $("#search-query").val();
  if (!term) return;

  const shows = await getShowsByTerm(term);

  const $episodesArea = $("#episodes-area");
  $episodesArea.hide();
  populateShows(shows);
});

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodes(id) {
  let response = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);

  let episodes = response.data.map(episode => ({
    id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number,
  }));

  return episodes;
}

function populateEpisodes(episodes) {
  const $episodesList = $("#episodes-list");
  $episodesList.empty();
    
  for (let episode of episodes) {
    let $show = $(
      `<li>
         ${episode.name}
         (season ${episode.season}, episode ${episode.number})
       </li>
      `);

    $episodesList.append($show);
  }

  $("#episodes-area").show();
}

$("#shows-list").on("click", ".get-episodes", async function handleClick(evt) {
  let showId = $(evt.target).closest(".Show").data("show-id");
  let episodes = await getEpisodes(showId);
  populateEpisodes(episodes);
});