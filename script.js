const apiKey = "22490a9015cff5ce7a687f26b3c4bb2a";
const elementoFilmes = document.getElementById("filmes");
const tituloPrincipal = document.querySelector(".cabecalho__titulo");
const inputPesquisa = document.querySelector(".cabecalho__pesquisa-input");
const botaoLupa = document.querySelector(".cabecalho__pesquisa-lupa");
const favoritosIcon = document.getElementById("favoritos-icon");
const listaVazia = document.querySelector(".card__lista-vazia");
const botaoProximo = document.getElementById("btn-proximo");
let listaDeFavoritos = [];
let filmesPopulares = [];
let currentPage = 1;

function inserirFilmesNaTela(filmes) {
  elementoFilmes.innerHTML = "";
  filmes.forEach((filme) => {
    const { id, title, release_date, poster_path, vote_average, overview } =
      filme;
    const anoLancamento = release_date.split("-")[0];
    const capa = `https://image.tmdb.org/t/p/w500/${poster_path}`;
    const secao = document.createElement("section");
    secao.className = "cards";
    secao.dataset.movieId = id;

    const parte1 = document.createElement("div");
    parte1.className = "cards__parte1";
    const img = document.createElement("img");
    img.src = capa;
    img.alt = "Capa";
    img.className = "cards__parte1-capa";
    parte1.appendChild(img);

    const parte2 = document.createElement("div");
    parte2.className = "cards__parte2";
    const titulo = document.createElement("h2");
    titulo.className = "cards__parte2-titulo";
    titulo.textContent = `${title} (${anoLancamento})`;
    const detalhes = document.createElement("div");
    detalhes.className = "cards__parte2-details";

    const avaliacaoDiv = document.createElement("div");
    const estrela = document.createElement("img");
    estrela.src = "img/Star.svg";
    estrela.alt = "Estrela";
    estrela.className = "cards__parte2-icon";
    const avaliacaoTexto = document.createElement("h2");
    avaliacaoTexto.className = "cards__parte2-text";
    avaliacaoTexto.textContent = vote_average.toFixed(1);
    avaliacaoDiv.appendChild(estrela);
    avaliacaoDiv.appendChild(avaliacaoTexto);

    const favoritoDiv = document.createElement("div");
    const favoritoIcon = document.createElement("img");
    favoritoIcon.src = listaDeFavoritos.includes(id)
      ? "./img/heart-full.png"
      : "./img/heart-empty.png";
    favoritoIcon.alt = "Favoritar";
    favoritoIcon.className = "cards__parte2-favorito-icon";
    favoritoIcon.style.cursor = "pointer";
    favoritoIcon.addEventListener("click", () => {
      if (listaDeFavoritos.includes(id)) {
        listaDeFavoritos = listaDeFavoritos.filter((favId) => favId !== id);
        favoritoIcon.src = "./img/heart-empty.png";
      } else {
        listaDeFavoritos.push(id);
        favoritoIcon.src = "./img/heart-full.png";
      }
      if (favoritosIcon.src.includes("heart-full.png")) {
        exibirFavoritos();
      }
    });

    const favoritoTexto = document.createElement("h2");
    favoritoTexto.className = "cards__parte2-text";
    favoritoDiv.appendChild(favoritoIcon);
    favoritoDiv.appendChild(favoritoTexto);

    detalhes.appendChild(avaliacaoDiv);
    detalhes.appendChild(favoritoDiv);
    parte2.appendChild(titulo);
    parte2.appendChild(detalhes);

    const parte3 = document.createElement("div");
    parte3.className = "cards__parte3";
    const descricao = document.createElement("p");
    descricao.className = "cards__parte3-texto";
    descricao.textContent = overview;
    parte3.appendChild(descricao);

    secao.appendChild(parte1);
    secao.appendChild(parte2);
    secao.appendChild(parte3);
    elementoFilmes.appendChild(secao);
  });
}

async function carregarFilmesPopulares() {
  try {
    let filmes = [];
    let page = 1;

    while (filmes.length < 40) {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=pt-BR&page=${page}`
      );
      const data = await response.json();
      filmes = filmes.concat(data.results);
      page++;
    }

    filmesPopulares = filmes.slice(0, 40);
    inserirFilmesNaTela(filmesPopulares);
  } catch (erro) {
    console.error("Erro ao carregar filmes populares:", erro);
  }
}

async function carregarProximaPagina() {
  try {
    currentPage++;
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=pt-BR&page=${currentPage}`
    );
    const data = await response.json();
    const novosFilmes = data.results;

    filmesPopulares = filmesPopulares.concat(novosFilmes);
    inserirFilmesNaTela(filmesPopulares);
  } catch (erro) {
    console.error("Erro ao carregar a próxima página:", erro);
  }
}

async function pesquisarFilmes() {
  const termoPesquisa = inputPesquisa.value.trim();
  if (termoPesquisa === "") {
    inserirFilmesNaTela(filmesPopulares);
    return;
  }
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=pt-BR&query=${termoPesquisa}&page=1&include_adult=false`
    );
    const data = await response.json();
    const filmes = data.results;
    inserirFilmesNaTela(filmes);
  } catch (erro) {
    console.error("Erro ao pesquisar filmes:", erro);
  }
}

async function exibirFavoritos() {
  if (listaDeFavoritos.length === 0) {
    elementoFilmes.innerHTML = "";
    listaVazia.style.display = "flex";
    return;
  }
  try {
    listaVazia.style.display = "none";
    const filmesFavoritos = [];
    for (const id of listaDeFavoritos) {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=pt-BR`
      );
      const filme = await response.json();
      filmesFavoritos.push(filme);
    }
    inserirFilmesNaTela(filmesFavoritos);
  } catch (erro) {
    console.error("Erro ao exibir filmes favoritos:", erro);
  }
}

favoritosIcon.addEventListener("click", () => {
  const isShowingFavorites = favoritosIcon.src.includes("heart-full.png");
  if (isShowingFavorites) {
    favoritosIcon.src = "./img/heart-empty.png";
    inserirFilmesNaTela(filmesPopulares);
    listaVazia.style.display = "none";
  } else {
    favoritosIcon.src = "./img/heart-full.png";
    exibirFavoritos();
  }
});

botaoLupa.addEventListener("click", pesquisarFilmes);
tituloPrincipal.addEventListener("click", () => {
  inserirFilmesNaTela(filmesPopulares);
  favoritosIcon.src = "./img/heart-empty.png";
  listaVazia.style.display = "none";
});

botaoProximo.addEventListener("click", carregarProximaPagina);

carregarFilmesPopulares();
