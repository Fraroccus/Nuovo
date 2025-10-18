import { Shelf } from "../types";

const latency = () => 50 + Math.random() * 100;

const wait = (duration: number) => new Promise((resolve) => setTimeout(resolve, duration));

export async function saveShelf(shelf: Shelf) {
  await wait(latency());
  return shelf;
}

export async function createShelf(shelf: Shelf) {
  await wait(latency());
  return shelf;
}
