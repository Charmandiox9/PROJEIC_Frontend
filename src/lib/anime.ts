import type { AnimeParams, AnimeInstance } from "animejs";

type AnimeStatic = (params: AnimeParams) => AnimeInstance;

let _anime: any = null;

export async function runAnime(params: AnimeParams): Promise<AnimeInstance> {
  if (!_anime) {
    const mod = await import("animejs");

    _anime = mod.default ?? mod;
  }
  return (_anime as AnimeStatic)(params);
}

export async function getStagger() {
  if (!_anime) {
    const mod = await import("animejs");
    _anime = mod.default ?? mod;
  }
  return (_anime as any).stagger as (
    value: number | string,
    options?: object,
  ) => unknown;
}
