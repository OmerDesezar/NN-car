import { Coord, Road } from "../types";
import { lerp } from "./logicUtils";

let road: Road = null;

const setRoad = (x: number, width: number, laneCount: number = 3) => {
	const left = x - width / 2;
	const right = x + width / 2;
	const top = 10000000;
	const bottom = -10000000;
	const topLeft: Coord = { x: left, y: top };
	const topRight: Coord = { x: right, y: top };
	const bottomLeft: Coord = { x: left, y: bottom };
	const bottomRight: Coord = { x: right, y: bottom };

	road = {
		x,
		width,
		laneCount,
		left,
		right,
		top,
		bottom,
		topLeft,
		topRight,
		bottomLeft,
		bottomRight,
		borders: [
			[topLeft, bottomLeft],
			[topRight, bottomRight],
		],
	};
};

const getLaneCenter = (laneIndex: number = 0) => {
	const laneWidth = road.width / road.laneCount;
	return (
		road.left +
		laneWidth / 2 +
		laneWidth * Math.min(laneIndex, road.laneCount - 1)
	);
};

const drawRoad = (ctx: any) => {
	ctx.lineWidth = 5;
	ctx.strokeStyle = "white";

	for (let i = 1; i < road.laneCount; i++) {
		const x = lerp(road.left, road.right, i / road.laneCount);
		ctx.setLineDash([30, 30]);
		ctx.beginPath();
		ctx.moveTo(x, road.top);
		ctx.lineTo(x, road.bottom);
		ctx.stroke();
	}
	ctx.setLineDash([]);
	road.borders.forEach((border) => {
		ctx.beginPath();
		ctx.moveTo(border[0].x, border[0].y);
		ctx.lineTo(border[1].x, border[1].y);
		ctx.stroke();
	});
};
