import { Car } from "./Car";
import { NeuralNetwork } from "./Network";
import { drawVisualizer } from "./visualizerLogic";
import { Road } from "./Road";
import { generateNumbersInRange } from "./logicUtils";

export const SIMULATION_WIDTH = 600;
const road = new Road(150, SIMULATION_WIDTH * 0.4, 5);
let cars = [];
let bestCar = cars[0];
let traffic = [];
let best;

export const startSimulation = () => {
  generateCars(1500);
  setGameInterval();
  startTutorial();
};

export const drawSimulation = (ctx, time, frameCount) => {
  ctx.reset();
  ctx.canvas.height = window.innerHeight * 0.5;
  bestCar = cars.reduce((prev, curr) => (prev.y < curr.y ? prev : curr));
  traffic.forEach((tCar) => tCar.update());
  cars.forEach((car) => car.update(road.borders, traffic));
  ctx.save();
  ctx.translate(0, -bestCar.y + window.innerHeight * 0.4);
  road.draw(ctx);
  traffic.forEach((trafficCar) => trafficCar.draw(ctx, "red"));
  ctx.globalAlpha = 0.2;
  cars.forEach((car) => car.draw(ctx, "blue", false));
  ctx.globalAlpha = 1;
  bestCar.draw(ctx, "blue", true);
};

export const drawNetwork = (ctx, time, frameCount) => {
  ctx.reset();
  ctx.canvas.height = window.innerHeight * 0.5;
  ctx.lineDashOffset = -time / 50;
  drawVisualizer(ctx, bestCar.brain);
};

const generateCars = (numOfCars) => {
  for (let i = 0; i < numOfCars; i++) {
    cars.push(new Car(road.getLaneCenter(2), 100, 30, 50, 3, 0.2, "AI"));
  }
  if (best) {
    cars.forEach((car) => {
      car.brain = best.brain;
      if (car !== bestCar) NeuralNetwork.mutateBrain(car.brain, 0.2);
    });
  }
};

const startTutorial = () => {
  traffic = [
    new Car(road.getLaneCenter(2), -300, 30, 50, 2, 0.2, "DUMMY"),
    new Car(road.getLaneCenter(1), -600, 30, 50, 2, 0.2, "DUMMY"),
    new Car(road.getLaneCenter(3), -600, 30, 50, 2, 0.2, "DUMMY"),
    new Car(road.getLaneCenter(1), -900, 30, 50, 2, 0.2, "DUMMY"),
    new Car(road.getLaneCenter(2), -900, 30, 50, 2, 0.2, "DUMMY"),
    new Car(road.getLaneCenter(3), -900, 30, 50, 2, 0.2, "DUMMY"),
    new Car(road.getLaneCenter(0), -1200, 30, 50, 2, 0.2, "DUMMY"),
    new Car(road.getLaneCenter(1), -1200, 30, 50, 2, 0.2, "DUMMY"),
    new Car(road.getLaneCenter(3), -1200, 30, 50, 2, 0.2, "DUMMY"),
    new Car(road.getLaneCenter(4), -1200, 30, 50, 2, 0.2, "DUMMY"),
  ];

  setTimeout(setTrafficInterval, 27000);
};

const setGameInterval = () => {
  setInterval(() => {
    filterUselessCars();
    if (0 === cars.length) window.location.reload();
  }, 1000);
};

const filterUselessCars = () => {
  cars = cars.filter(
    (car) =>
      car.y - bestCar.y < 250 && !car.damaged && car.speed > car.maxSpeed * 0.85
  );
  traffic = traffic.filter((car) => car.y - bestCar.y < 1500);
};

const setTrafficInterval = () => setInterval(spawnTraffic, 2000);

const spawnTraffic = () => {
  const numOfCarsToSpawn = generateNumbersInRange(1, road.laneCount - 1, 1)[0];
  const carLanes = generateNumbersInRange(
    0,
    road.laneCount - 1,
    numOfCarsToSpawn
  );

  carLanes.forEach((laneNum) =>
    traffic.push(
      new Car(
        road.getLaneCenter(laneNum),
        bestCar.y - 750,
        30,
        50,
        2,
        0.2,
        "DUMMY"
      )
    )
  );
};

export const saveBestBrain = () => {
  best.brain = bestCar.brain;
  best.fitness = -bestCar.y;
};

export const discard = () => (best = null);
