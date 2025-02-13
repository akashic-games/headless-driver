// NOTE: node-canvas ライブラリを利用しない環境で型定義の参照に失敗するケースを回避するため、 `@ts-ignore` で明示的にエラーを無視している

/** @ts-ignore */
export type { Canvas, Image, CanvasRenderingContext2D, ImageData, GlobalCompositeOperation } from "canvas";
