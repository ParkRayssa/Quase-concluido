import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

type Filme = {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  genres: { id: number; name: string }[];
};

type Elenco = {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
};

export default function DetalhesFilme() {
  const router = useRouter();
  const { id } = router.query;
  const [filme, setFilme] = useState<Filme | null>(null);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [elenco, setElenco] = useState<Elenco[]>([]);
  const [erro, setErro] = useState("");

  const API_KEY = "001669de757773bb76383d910c21e88f";

  useEffect(() => {
    if (!id) return;

    // Dados do filme
    axios
      .get(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=pt-BR`)
      .then((res) => setFilme(res.data))
      .catch(() => setErro("Filme não encontrado."));

    // Trailer
    axios
      .get(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}&language=pt-BR`)
      .then((res) => {
        const trailer = res.data.results.find(
          (video: any) =>
            video.type === "Trailer" && video.site === "YouTube"
        );
        if (trailer) setTrailerUrl(`https://www.youtube.com/embed/${trailer.key}`);
      });

    // Elenco
    axios
      .get(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${API_KEY}&language=pt-BR`)
      .then((res) => {
        setElenco(res.data.cast.slice(0, 8)); // mostra só os 8 principais
      });
  }, [id]);

  if (erro) return <p className="text-red-600 text-center mt-10">{erro}</p>;
  if (!filme) return <p className="text-center mt-10">Carregando...</p>;

  return (
    <div className="max-w-5xl mx-auto p-4 mt-24">
      <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Voltar para a página inicial
      </Link>

      <div className="flex flex-col md:flex-row gap-6">
        <img
          src={`https://image.tmdb.org/t/p/w500${filme.poster_path}`}
          alt={filme.title}
          className="rounded w-full md:w-1/3"
        />
        <div>
          <h1 className="text-3xl font-bold mb-2">{filme.title}</h1>
          <p className="text-sm text-gray-600 mb-2">
            Data de lançamento: {filme.release_date}
          </p>
          <p className="mb-4">{filme.overview || "Sem descrição."}</p>
          <p className="text-sm">
            <strong>Nota:</strong> {filme.vote_average}/10
          </p>
          <p className="text-sm mt-2">
            <strong>Gêneros:</strong>{" "}
            {filme.genres.map((g) => g.name).join(", ")}
          </p>
        </div>
      </div>

      {trailerUrl && (
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-2">Trailer</h2>
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src={trailerUrl}
              allowFullScreen
              className="w-full h-72 md:h-[400px] rounded"
            ></iframe>
          </div>
        </div>
      )}

      {elenco.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">Elenco Principal</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {elenco.map((ator) => (
              <div key={ator.id} className="text-center">
                <img
                  src={
                    ator.profile_path
                      ? `https://image.tmdb.org/t/p/w200${ator.profile_path}`
                      : "https://via.placeholder.com/200x300?text=Sem+Imagem"
                  }
                  alt={ator.name}
                  className="rounded shadow mb-2 mx-auto"
                />
                <p className="font-medium">{ator.name}</p>
                <p className="text-sm text-gray-600">como {ator.character}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
