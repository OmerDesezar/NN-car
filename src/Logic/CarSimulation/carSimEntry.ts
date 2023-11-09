import { SIMULATION_WIDTH } from "../../Components/Canvas";
import { filterUselessCars, restartSim } from "./carLogic";
import { setRoad } from "./roadLogic";

let gameIntervalId;

export const init = () => {
	if (gameIntervalId) return;
	setRoad(150, SIMULATION_WIDTH * 0.4, 5);
	restartSim();
	gameIntervalId = setInterval(() => {
		if (filterUselessCars()) {
			console.log("starting again");
			restartSim();
		}
	}, 1000);
};
