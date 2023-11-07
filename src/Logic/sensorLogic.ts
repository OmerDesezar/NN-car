import { Car, Coord, Sensor } from "../types";
import { getIntersection, lerp } from "./logicUtils";

export const makeSensor = (car: Car): Sensor => {
	return {
		car,
		rayCount: 7,
		rayLength: 100,
		raySpread: Math.PI * 0.75,
		rays: [],
		readings: [],
	};
};

export const updateSensor = (
	sensor: Sensor,
	roadBorders: Coord[][],
	traffic: Car[]
): void => {
	updateSensorRays(sensor);
	getSensorReadings(sensor, roadBorders, traffic);
};

export const drawSensor = (ctx: any, sensor: Sensor): void => {
	for (let i = 0; i < sensor.rays.length; i++) {
		const end = sensor.readings[i] ? sensor.readings[i] : sensor.rays[i][1];

		ctx.beginPath();
		ctx.lineWidth = 2;
		ctx.strokeStyle = "Yellow";
		ctx.moveTo(sensor.rays[i][0].x, sensor.rays[i][0].y);
		ctx.lineTo(end.x, end.y);
		ctx.stroke();

		ctx.beginPath();
		ctx.lineWidth = 2;
		ctx.strokeStyle = "Black";
		ctx.moveTo(sensor.rays[i][1].x, sensor.rays[i][1].y);
		ctx.lineTo(end.x, end.y);
		ctx.stroke();
	}
};

const updateSensorRays = (sensor: Sensor): void => {
	sensor.rays = [];
	for (let i = 0; i < sensor.rayCount; i++) {
		const rayAngle =
			lerp(
				sensor.raySpread / 2,
				-sensor.raySpread / 2,
				sensor.rayCount === 1 ? 0.5 : i / (sensor.rayCount - 1)
			) + sensor.car.angle;

		const start = { x: sensor.car.x, y: sensor.car.y };
		const end = {
			x: start.x - Math.sin(rayAngle) * sensor.rayLength,
			y: start.y - Math.cos(rayAngle) * sensor.rayLength,
		};
		sensor.rays.push([start, end]);
	}
};

const getSensorReadings = (
	sensor: Sensor,
	roadBorders: Coord[][],
	traffic: Car[]
): void => {
	sensor.readings = [];
	sensor.rays.forEach((ray) =>
		sensor.readings.push(getSensorReading(ray, roadBorders, traffic))
	);
};

const getSensorReading = (
	ray: Coord[],
	roadBorders: Coord[][],
	traffic: Car[]
): Coord | null => {
	const touches = [];
	roadBorders.forEach((roadBorder) => {
		const touch = getIntersection(ray[0], ray[1], roadBorder[0], roadBorder[1]);
		if (touch) touches.push(touch);
	});
	traffic.forEach((trafficCar) => {
		for (let i = 0; i < trafficCar.polygon.length; i++) {
			const touch = getIntersection(
				ray[0],
				ray[1],
				trafficCar.polygon[i],
				trafficCar.polygon[(i + 1) % trafficCar.polygon.length]
			);
			if (touch) touches.push(touch);
		}
	});
	if (0 === touches.length) return null;
	return touches.reduce((prev, curr) =>
		prev.offset < curr.offset ? prev : curr
	);
};
