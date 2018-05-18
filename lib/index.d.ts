export as namespace ghpages;

export interface config {
  src?: string|string[],
  branch?: string,
  dest?: string,
  dotfiles?: boolean,
  add?: boolean,
  repo?: string,
  remote?: string,
  tag?: string,
  message?: string,
  user?: {
    email: string,
    name: string,
  },
  clone?: string,
  push?: boolean,
  silent?: boolean,
  git?: string,
  depth?: number,
  only?: string,
}

export function publish(
  dir: string,
  options?: config,
  callback?: (err: any) => any,
): void;

export function clean(): void;
