const express = require("express");
const app = express();
app.use(express.json());

const path = require("path");
const filePath = path.join(__dirname, "moviesData.db");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: filePath,
      driver: sqlite3.Database,
    });
    app.listen(3000);
    console.log("Server is running at http://localhost:3000/");
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const DBToResponseObject = (DBObj) => ({
  movieId: DBObj.movie_id,
  directorId: DBObj.director_id,
  movieName: DBObj.movie_name,
  leadActor: DBObj.lead_actor,
});

//Get movies
app.get("/movies/", async (request, response) => {
  getMoviesQuery = `SELECT movie_name as movieName FROM movie;`;
  const allMovies = await db.all(getMoviesQuery);
  response.send(allMovies);
});

//Add movie
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;

  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `INSERT INTO movie (director_id, movie_name, lead_actor) VALUES (${directorId}, '${movieName}', '${leadActor}');`;
  await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//Get Movie
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  const movieObj = DBToResponseObject(movie);
  response.send(movieObj);
});

//Update Movie
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `UPDATE movie SET director_id = ${directorId}, movie_name = '${movieName}', lead_actor = '${leadActor}' WHERE movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//Delete Movie
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE FROM movie WHERE movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//Get Directors
app.get("/directors/", async (request, response) => {
  getMoviesQuery = `SELECT director_id as directorId, director_name as directorName FROM director;`;
  const allDirectors = await db.all(getMoviesQuery);
  response.send(allDirectors);
});

//Get Movies of Director
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesOfDirectorQuery = `SELECT movie_name as movieName FROM movie WHERE director_id = ${directorId};`;
  const MoviesOfDirector = await db.all(getMoviesOfDirectorQuery);
  response.send(MoviesOfDirector);
});
module.exports = app;
