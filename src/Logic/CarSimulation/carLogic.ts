import { Car, ControlType, Coord } from "../../types";
import { makeControls } from "./controlsLogic";
import { generateNumbersInRange, polyIntersect } from "../logicUtils";
import {
	drawNetwork,
	makeNetwork,
	mutateNetwork,
	networkFeedForward,
} from "../networkLogic";
import {
	drawRoad,
	getLaneCenter,
	getLaneCount,
	getRoadBorders,
} from "./roadLogic";
import { drawSensor, makeSensor, updateSensor } from "./sensorLogic";
import redCar from "../../Assets/redCar.jpg";
import blueCar from "../../Assets/blueCar.jpg";

const carImg = new Image();
carImg.src = blueCar;
const trafficImg = new Image();
trafficImg.src = redCar;

let cars: Car[] = [];
let traffic: Car[] = [];
let bestCar: Car;
let firstCar: Car;
let trafficId;

const makeCar = (
	x: number,
	y: number,
	width: number,
	height: number,
	maxSpeed: number = 3,
	acceleration: number = 0.2,
	type: ControlType
): Car => {
	const car: Car = {
		x,
		y,
		height,
		width,
		speed: 0,
		angle: 0,
		friction: 0,
		turn: 0.03,
		maxSpeed,
		acceleration,
		damaged: false,
		polygon: [],
		useBrain: "AI" === type,
		controls: makeControls(type),
	};

	if ("DUMMY" !== type) {
		car.sensor = makeSensor(car);
		car.brain = makeNetwork([car.sensor.rayCount, 5, 4]);
	}
	return car;
};

export const drawFirstCarNetwork = (ctx, time, frameCount) => {
	ctx.reset();
	ctx.canvas.height = window.innerHeight * 0.5;
	ctx.lineDashOffset = -time / 50;
	drawNetwork(ctx, firstCar?.brain);
};

export const restartSim = () => {
	clearTraffic();
	generateCars(1500);
	generateTraffic();
};

const generateCars = (numOfCars: number) => {
	for (let i = 0; i < numOfCars; i++) {
		cars.push(makeCar(getLaneCenter(2), 100, 30, 50, 3, 0.2, "AI"));
	}
	if (bestCar) {
		cars.forEach((car) => {
			car.brain = bestCar.brain;
			if (car !== bestCar) mutateNetwork(car.brain, 0.2);
		});
	}
};

const clearTraffic = () => {
	traffic = [];
	clearTimeout(trafficId);
	clearInterval(trafficId);
};

const generateTraffic = () => {
	traffic.push(
		makeCar(getLaneCenter(2), -300, 30, 50, 2, 0.2, "DUMMY"),
		makeCar(getLaneCenter(1), -600, 30, 50, 2, 0.2, "DUMMY"),
		makeCar(getLaneCenter(3), -600, 30, 50, 2, 0.2, "DUMMY"),
		makeCar(getLaneCenter(1), -900, 30, 50, 2, 0.2, "DUMMY"),
		makeCar(getLaneCenter(2), -900, 30, 50, 2, 0.2, "DUMMY"),
		makeCar(getLaneCenter(3), -900, 30, 50, 2, 0.2, "DUMMY"),
		makeCar(getLaneCenter(0), -1200, 30, 50, 2, 0.2, "DUMMY"),
		makeCar(getLaneCenter(1), -1200, 30, 50, 2, 0.2, "DUMMY"),
		makeCar(getLaneCenter(3), -1200, 30, 50, 2, 0.2, "DUMMY"),
		makeCar(getLaneCenter(4), -1200, 30, 50, 2, 0.2, "DUMMY")
	);
	trafficId = setTimeout(
		() => (trafficId = setInterval(spawnTraffic, 2000)),
		27000
	);
};

const spawnTraffic = () => {
	const trafficImg = new Image();
	trafficImg.src = "../../Assets/redCar.jpg";

	const numToSpawn = generateNumbersInRange(1, getLaneCount() - 1, 1)[0];
	const carLanes = generateNumbersInRange(0, getLaneCount() - 1, numToSpawn);

	carLanes.forEach((laneNum) =>
		traffic.push(
			makeCar(getLaneCenter(laneNum), firstCar.y - 750, 30, 50, 2, 0.2, "DUMMY")
		)
	);
};

export const filterUselessCars = () => {
	cars = cars.filter(
		(car) =>
			car.y - firstCar.y < 250 &&
			!car.damaged &&
			car.speed > car.maxSpeed * 0.85
	);
	traffic = traffic.filter((tCar) => tCar.y - firstCar.y < 1500);
	return cars.length === 0;
};

const drawCar = (
	ctx: any,
	car: Car,
	shouldDrawSensor: boolean = false
): void => {
	if (car.sensor && shouldDrawSensor) {
		drawSensor(ctx, car.sensor);
	}
	ctx.save();
	ctx.translate(car.x, car.y);
	ctx.rotate(-car.angle);
	ctx.drawImage(
		car.brain ? carImg : trafficImg,
		-car.width / 2,
		-car.height / 2,
		car.width,
		car.height
	);
	ctx.restore();
};

const updateCar = (
	car: Car,
	roadBorders?: Coord[][],
	traffic?: Car[]
): void => {
	if (!car.damaged) {
		moveCar(car);
		car.polygon = getCarPolygon(car);
		car.damaged = getCarDamage(car, roadBorders, traffic);
	}
	if (car.sensor) {
		updateSensor(car.sensor, roadBorders, traffic);
		const offsets = car.sensor.readings.map((r) =>
			null == r ? 0 : 1 - r.offset
		);
		const outputs = networkFeedForward(offsets, car.brain);
		if (car.useBrain) {
			car.controls.forward = outputs[0] > 0.5; //?
			car.controls.left = outputs[1] > 0.5; //?
			car.controls.right = outputs[2] > 0.5; //?
			car.controls.reverse = outputs[3] > 0.5; //?
		}
	}
};

export const drawCarSim = (ctx, time, frameCount) => {
	if (cars.length === 0) return;
	ctx.reset();
	ctx.canvas.height = window.innerHeight * 0.5;
	firstCar = cars.reduce((prev, curr) => (prev.y < curr.y ? prev : curr));
	traffic.forEach((tCar) => updateCar(tCar));
	cars.forEach((car) => updateCar(car, getRoadBorders(), traffic));
	ctx.save();
	ctx.translate(0, -firstCar.y + window.innerHeight * 0.4);
	drawRoad(ctx);
	traffic.forEach((tCar) => drawCar(ctx, tCar));
	ctx.globalAlpha = 0.2;
	cars.forEach((car) => drawCar(ctx, car));
	ctx.globalAlpha = 1;
	drawCar(ctx, firstCar, true);
};

const moveCar = (car: Car): void => {
	const flip = car.speed > 0 ? 1 : car.speed < 0 ? -1 : 0;
	if (car.controls.forward) car.speed += car.acceleration;
	if (car.controls.reverse) car.speed -= car.acceleration;
	if (car.controls.left) car.angle += car.turn * flip;
	if (car.controls.right) car.angle -= car.turn * flip;
	if (car.speed > car.maxSpeed) car.speed = car.maxSpeed;
	if (car.speed < -car.maxSpeed / 2) car.speed = -car.maxSpeed / 2;
	if (Math.abs(car.speed) < car.friction) car.speed = 0;
	if (Math.abs(car.speed) > 0) car.speed -= car.friction * flip;
	car.x -= Math.sin(car.angle) * car.speed;
	car.y -= Math.cos(car.angle) * car.speed;
};

const getCarPolygon = (car: Car): Coord[] => {
	const points = [];
	const rad = Math.hypot(car.width, car.height) / 2;
	const alpha = Math.atan2(car.width, car.height);
	points.push({
		x: car.x - Math.sin(car.angle - alpha) * rad,
		y: car.y - Math.cos(car.angle - alpha) * rad,
	});
	points.push({
		x: car.x - Math.sin(car.angle + alpha) * rad,
		y: car.y - Math.cos(car.angle + alpha) * rad,
	});
	points.push({
		x: car.x - Math.sin(Math.PI + car.angle - alpha) * rad,
		y: car.y - Math.cos(Math.PI + car.angle - alpha) * rad,
	});
	points.push({
		x: car.x - Math.sin(Math.PI + car.angle + alpha) * rad,
		y: car.y - Math.cos(Math.PI + car.angle + alpha) * rad,
	});
	return points;
};

const getCarDamage = (
	car: Car,
	roadBorders: Coord[][],
	traffic: Car[]
): boolean => {
	if (!roadBorders) return false;
	return (
		roadBorders.some((roadBorder) => polyIntersect(car.polygon, roadBorder)) ||
		traffic.some((trafficCar) => polyIntersect(car.polygon, trafficCar.polygon))
	);
};
