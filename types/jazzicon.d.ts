// types/blockies.d.ts
declare module "ethereum-blockies" {
  export default {
    create(options: { seed: string; size?: number; scale?: number }): HTMLCanvasElement;
  };
}
