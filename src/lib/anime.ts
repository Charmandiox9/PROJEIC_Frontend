import type { AnimeParams, AnimeInstance } from "animejs";

let _anime: ((params: AnimeParams) => AnimeInstance) | null = null;

export async function runAnime(params: AnimeParams): Promise<AnimeInstance> {
  if (!_anime) {
    const mod = await import("animejs/lib/anime.esm.js").catch(
      () => import("animejs"),
    );
    _anime = (
      typeof mod.default === "function" ? mod.default : mod
    ) as typeof _anime;
  }
  return _anime!(params);
}

export async function getStagger() {
  const mod = await import("animejs/lib/anime.esm.js").catch(
    () => import("animejs"),
  );
  const anime = (typeof mod.default === "function" ? mod.default : mod) as any;
  return anime.stagger as (value: number | string, options?: object) => unknown;
}
