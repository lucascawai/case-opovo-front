const API_KEY = ""; // Insira sua chave aqui
const MOVIE_ID = 346698; // Exemplo: "Clube da Luta" 550

const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

const languageDisplay = new Intl.DisplayNames(["pt-BR"], { type: "language" });
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const statusMap = {
  Rumored: "Rumor",
  Planned: "Planejado",
  "In Production": "Em produção",
  "Post Production": "Pós-produção",
  Released: "Lançado",
  Canceled: "Cancelado",
};

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

    const statusOriginal = movie.status; // Ex: "Released"
    const statusTranslated = statusMap[statusOriginal] || statusOriginal;
    document.getElementById("status").textContent = statusTranslated;
    document.getElementById(
      "budget"
    ).textContent = `$${movie.budget.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    })}`;
    document.getElementById("language").textContent = capitalize(
      languageDisplay.of(movie.original_language)
    );
    document.getElementById(
      "revenue"
    ).textContent = `$${movie.revenue.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    })}`;

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

async function loadCast() {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/${MOVIE_ID}/credits?api_key=${API_KEY}&language=pt-BR`
    );
    const data = await response.json();
    const cast = data.cast.slice(0, 10); // first 10

    const carousel = document.getElementById("cast-carousel");
    carousel.innerHTML = "";

    cast.forEach((actor) => {
      const profilePath = actor.profile_path
        ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
        : ""; // "assets/images/avatar-placeholder.jpg"; fallback, não tenho fallback por enquanto

      const card = document.createElement("div");
      card.className = "cast-member";
      card.innerHTML = `
          <img src="${profilePath}" alt="${actor.name}">
          <p class="cast-member-name">${actor.name}</p>
          <p class="cast-member-character">${actor.character}</p>
        `;
      carousel.appendChild(card);
    });
  } catch (error) {
    console.error("Erro ao carregar elenco:", error);
  }
}

function setupFadeEffect(wrapperSelector = ".fade-control") {
  const wrappers = document.querySelectorAll(wrapperSelector);

  wrappers.forEach((wrapper) => {
    const carousel = wrapper.querySelector(".carousel");

    if (!carousel) return;

    function updateFade() {
      const scrollLeft = carousel.scrollLeft;
      const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;

      wrapper.classList.toggle("fade-left", scrollLeft > 5);
      wrapper.classList.toggle("fade-right", scrollLeft < maxScrollLeft - 5);
    }

    // Bind evento
    carousel.addEventListener("scroll", updateFade);

    // Inicializa após o conteúdo ser carregado
    setTimeout(updateFade, 0);
  });
}

// Após inserir os cards no carousel:
loadCast().then(() => {
  setupFadeEffect(); // atualiza o fade logo depois de adicionar os itens
});

const reviewsContainer = document.querySelector(".reviews-cards");

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

async function renderReviews() {
  try {
    const res = await fetch(
      `${BASE_URL}/movie/${MOVIE_ID}/reviews?api_key=${API_KEY}&language=pt-BR&page=1`
    );
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const data = await res.json();
    const reviews = data.results || [];

    reviewsContainer.innerHTML = "";

    reviews.slice(0, 2).forEach((review) => {
      const card = document.createElement("div");
      card.classList.add("review-card");

      //   const cleanContent = removeQuotes(review.content);

      card.innerHTML = `
            <p class="review-text">${review.content}</p>
            <div class="review-footer">
              <div class="review-footer-left">
                <span><span class="review-by">por</span> <span class="review-author">${
                  review.author
                }</span></span>

                <span class="review-date">${formatDate(
                  review.created_at || review.updated_at
                )}</span>
              </div>
              <div class="review-footer-right">
                <span><span class="review-label">Nota:</span> <span class="review-rating">${
                  review.author_details?.rating
                    ? review.author_details.rating
                    : "N/A"
                }</span><span class="review-label">/10</span></span>

              </div>
            </div>
          `;

      reviewsContainer.appendChild(card);
    });
  } catch (error) {
    reviewsContainer.innerHTML = `<p>Erro ao carregar as resenhas: ${error.message}</p>`;
    console.error("Erro ao buscar reviews:", error);
  }
}

renderReviews();

function setupMobileFadeEffect(querySelector) {
  const isMobileOrTablet = window.innerWidth <= 800; // ou 600, se for seu breakpoint

  if (!isMobileOrTablet) return; // só aplica no mobile

  const wrappers = document.querySelectorAll(querySelector);

  wrappers.forEach((wrapper) => {
    const carousel = wrapper.querySelector(".carousel-mobile");
    if (!carousel) return;

    function updateFade() {
      const scrollLeft = carousel.scrollLeft;
      const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;

      wrapper.classList.toggle("fade-left", scrollLeft > 5);
      wrapper.classList.toggle("fade-right", scrollLeft < maxScrollLeft - 5);
    }

    carousel.addEventListener("scroll", updateFade);
    setTimeout(updateFade, 0);
  });
}

async function fetchVideos() {
  try {
    const res = await fetch(
      `${BASE_URL}/movie/${MOVIE_ID}/videos?api_key=${API_KEY}&language=pt-BR`
    );
    const data = await res.json();

    const videos = data.results.filter((v) => v.site === "YouTube");

    const videoCountElement = document.querySelector(".media-videos-count");
    videoCountElement.textContent = `(${videos.length})`;

    const videoContainer = document.querySelector(".media-videos-carousel");
    videoContainer.innerHTML = "";

    videos.forEach((video) => {
      const videoCard = document.createElement("div");
      videoCard.classList.add("video-card");

      videoCard.innerHTML = `
        <a href="https://www.youtube.com/watch?v=${video.key}" target="_blank" rel="noopener">
          <img src="https://img.youtube.com/vi/${video.key}/hqdefault.jpg" alt="${video.name}" />
        </a>
      `;

      videoContainer.appendChild(videoCard);
    });
  } catch (error) {
    console.error("Erro ao buscar vídeos:", error);
    videoContainer.innerHTML = "<p>Erro ao carregar vídeos.</p>";
  }
}

function hideOverflowingVideoCards(containerSelector, cardSelector, cardWidth) {
  const container = document.querySelector(containerSelector);
  const cards = container.querySelectorAll(cardSelector);

  const containerWidth = container.clientWidth;
  const gap = 16; // 1rem = 16px, ajuste se o gap mudar
  const totalCardWidth = cardWidth + gap;

  // Quantos cabem sem cortar
  const maxVisibleCards = Math.floor(containerWidth / totalCardWidth);

  cards.forEach((card, index) => {
    if (index >= maxVisibleCards) {
      card.style.display = "none";
    } else {
      card.style.display = "";
    }
  });
}

window.addEventListener("load", () => {
  hideOverflowingVideoCards(".media-videos-carousel", ".video-card", 300);
});
window.addEventListener("resize", () => {
  hideOverflowingVideoCards(".media-videos-carousel", ".video-card", 300);
});

fetchVideos().then(() => {
  setupMobileFadeEffect(".media-carousel-wrapper");
  hideOverflowingVideoCards(".media-videos-carousel", ".video-card", 300);
});

async function fetchPosters() {
  try {
    const res = await fetch(
      `${BASE_URL}/movie/${MOVIE_ID}/images?api_key=${API_KEY}`
    );
    const data = await res.json();

    const posters = data.posters; //.slice(0, 10); // limita a 10 pôsteres (ou quantos quiser)

    const postersCountElement = document.querySelector(".media-posters-count");
    postersCountElement.textContent = `(${posters.length})`;

    const posterContainer = document.querySelector(".media-posters-carousel");
    posterContainer.innerHTML = "";

    posters.forEach((poster) => {
      const posterCard = document.createElement("div");
      posterCard.classList.add("poster-card");

      posterCard.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w500${poster.file_path}" alt="Pôster do Filme" />
      `;

      posterContainer.appendChild(posterCard);
    });
  } catch (error) {
    console.error("Erro ao buscar pôsteres:", error);
    posterContainer.innerHTML = "<p>Erro ao carregar pôsteres.</p>";
  }
}

window.addEventListener("load", () => {
  hideOverflowingVideoCards(".media-posters-carousel", ".poster-card", 290);
});
window.addEventListener("resize", () => {
  hideOverflowingVideoCards(".media-posters-carousel", ".poster-card", 290);
});

fetchPosters().then(() => {
  setupMobileFadeEffect(".media-carousel-wrapper");
  hideOverflowingVideoCards(".media-posters-carousel", ".poster-card", 290);
});

async function fetchBackdrops() {
  try {
    const res = await fetch(
      `${BASE_URL}/movie/${MOVIE_ID}/images?api_key=${API_KEY}`
    );
    const data = await res.json();

    const backdrops = data.backdrops; //.slice(0, 10); // limitar a 10 imagens

    const backdropContainer = document.querySelector(
      ".media-backdrops-carousel"
    );
    const backdropCountElement = document.querySelector(
      ".media-backdrops-count"
    );
    backdropCountElement.textContent = `(${backdrops.length})`;

    backdropContainer.innerHTML = "";

    backdrops.forEach((backdrop) => {
      const backdropCard = document.createElement("div");
      backdropCard.classList.add("backdrop-card");

      backdropCard.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w780${backdrop.file_path}" alt="Imagem de fundo" />
      `;

      backdropContainer.appendChild(backdropCard);
    });
  } catch (error) {
    console.error("Erro ao buscar imagens de fundo:", error);
    backdropContainer.innerHTML = "<p>Erro ao carregar imagens de fundo.</p>";
  }
}

window.addEventListener("load", () => {
  hideOverflowingVideoCards(".media-backdrops-carousel", ".backdrop-card", 600);
});
window.addEventListener("resize", () => {
  hideOverflowingVideoCards(".media-backdrops-carousel", ".backdrop-card", 600);
});

fetchBackdrops().then(() => {
  setupMobileFadeEffect(".media-carousel-wrapper");
  hideOverflowingVideoCards(".media-backdrops-carousel", ".backdrop-card", 600);
});

async function fetchRecommendations() {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=pt-BR&page=1`
    );
    const data = await response.json();

    const container = document.getElementById("recommendations-carousel");
    container.innerHTML = "";

    const movies = data.results.slice(0, 10);

    movies.forEach((movie) => {
      const percentage = Math.floor(Math.random() * 50 + 50); // entre 50 e 99
      const card = document.createElement("div");
      card.classList.add("recommendation-card");

      card.innerHTML = `
          <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" />
          <p class="recommendation-title">${movie.title}</p>
          <p class="recommendation-rating">${percentage}%</p>
        `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Erro ao carregar recomendações:", error);
  }
}

window.addEventListener("load", () => {
  hideOverflowingVideoCards(
    ".recommendations-carousel",
    ".recommendation-card",
    180
  );
});
window.addEventListener("resize", () => {
  hideOverflowingVideoCards(
    ".recommendations-carousel",
    ".recommendation-card",
    180
  );
});

fetchRecommendations().then(() => {
  setupMobileFadeEffect(".recommendations-carousel-wrapper");
  hideOverflowingVideoCards(
    ".recommendations-carousel",
    ".recommendation-card",
    180
  );
});
