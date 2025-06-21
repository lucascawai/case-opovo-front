const API_KEY = "fa33d68cd36715fa3f7070976ba53415";
const MOVIE_ID = 550; // Exemplo: "Clube da Luta"

const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

async function getMovieDetails() {
  try {
    const [movieRes, creditsRes] = await Promise.all([
      fetch(`${BASE_URL}/movie/${MOVIE_ID}?api_key=${API_KEY}&language=pt-BR`),
      fetch(
        `${BASE_URL}/movie/${MOVIE_ID}/credits?api_key=${API_KEY}&language=pt-BR`
      ),
    ]);

    const movie = await movieRes.json();
    const credits = await creditsRes.json();

    // Dados principais
    document.getElementById("poster").src = IMAGE_BASE + movie.poster_path;
    document.getElementById("title").textContent = movie.title;
    document.getElementById("year").textContent = `(${new Date(
      movie.release_date
    ).getFullYear()})`;
    document.getElementById("genre").textContent = movie.genres
      .map((g) => g.name)
      .join(", ");
    document.getElementById("synopsis").textContent = movie.overview;

    document.getElementById("status").textContent = movie.status;
    document.getElementById(
      "budget"
    ).textContent = `$${movie.budget.toLocaleString()}`;
    document.getElementById("language").textContent =
      movie.original_language.toUpperCase();
    document.getElementById(
      "revenue"
    ).textContent = `$${movie.revenue.toLocaleString()}`;

    // Diretor e Escritor
    const director = credits.crew.find((p) => p.job === "Director");
    const writer = credits.crew.find(
      (p) => p.job === "Screenplay" || p.job === "Writer"
    );

    document.getElementById("director").textContent =
      director?.name || "Desconhecido";
    document.getElementById("writer").textContent =
      writer?.name || "Desconhecido";
  } catch (err) {
    console.error("Erro ao buscar dados do filme:", err);
  }
}

getMovieDetails();
