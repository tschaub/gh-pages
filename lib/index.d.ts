export as namespace ghpages;

export interface config {
    dest?: string,
    add?: boolean,
    git?: string,
    depth?: number,
    dotfiles?: boolean,
    branch?: string,
    repo?: string,
    remote?: string,
    src?: string|string[],
    only?: string,
    push?: boolean,
    message?: string,
    silent?: boolean,
    clone?: string,
    user?: {
      email: string,
      name: string,
    },
    tag?: string,
  }

export function publish(
    basePath: string,
    config?: config,
    callback?: (err: any) => any,
  ): void;

export function clean(): void;
