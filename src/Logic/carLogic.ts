import { Car, ControlType, Coord } from "../types";
import { makeControls } from "./controlsLogic";
import { polyIntersect } from "./logicUtils";
import { makeNetwork, networkFeedForward } from "./networkLogic";
import { drawSensor, makeSensor, updateSensor } from "./sensorLogic";

const cars: Car[] = [];
const traffic: Car[] = [];

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
		car.brain = makeNetwork([car.sensor.rayCount, 5, 5, 4]);
	}
	return car;
};

const drawCar = (
	ctx: any,
	color: string = "black",
	shouldDrawSensor: boolean,
	car: Car
): void => {
	if (car.damaged) ctx.fillStyle = "gray";
	else ctx.fillStyle = color;
	if (car.sensor && shouldDrawSensor) {
		drawSensor(ctx, car.sensor);
	}
	ctx.beginPath();
	ctx.moveTo(car.polygon[0].x, car.polygon[0].y);
	for (let i = 1; i < car.polygon.length; i++) {
		ctx.lineTo(car.polygon[i].x, car.polygon[i].y);
	}
	ctx.fill();
};

const updateCar = (car: Car, roadBorders: Coord[], traffic: Car[]): void => {
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
	roadBorders: Coord[],
	traffic: Car[]
): boolean => {
	return (
		roadBorders.some((roadBorder) => polyIntersect(car.polygon, roadBorder)) ||
		traffic.some((trafficCar) => polyIntersect(car.polygon, trafficCar.polygon))
	);
};
