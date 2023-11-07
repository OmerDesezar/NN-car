import { filterUselessCars, restartSimulation } from "./carLogic";
import { setRoad } from "./roadLogic";

export const SIMULATION_WIDTH = 600;

export let GAME_OVER = false;
let gameIntervalId;

export const init = () => {
	setRoad(150, SIMULATION_WIDTH * 0.4, 5);
	gameIntervalId = setInterval(() => {
		if (filterUselessCars()) {
			console.log("starting again");
			restartSimulation();
		}
	}, 1000);
};
