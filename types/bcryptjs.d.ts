declare module "bcryptjs" {
  export function compare(s: string, hash: string): Promise<boolean>;
}
