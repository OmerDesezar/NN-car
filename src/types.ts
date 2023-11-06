export type NetworkLevel = {
	inputs: number[];
	outputs: number[];
	biases: number[];
	weights: number[];
};

export type Network = {
	levels: NetworkLevel[];
};

export type Road = {
	x: number;
	width: number;
	laneCount: number;
	left: number;
	right: number;
	top: 10000000;
	bottom: -10000000;
	topLeft: Coord;
	topRight: Coord;
	bottomLeft: Coord;
	bottomRight: Coord;
	borders: Coord[][];
};

export type Sensor = {
	car: Car;
	rayCount: number;
	rayLength: number;
	raySpread: number;
	rays: Coord[][];
	readings: Coord[] | null;
};

export type Controls = {
	forward: boolean;
	reverse: boolean;
	left: boolean;
	right: boolean;
};

export type Car = {
	x: number;
	y: number;
	height: number;
	width: number;
	speed: number;
	angle: number;
	friction: number;
	turn: number;
	maxSpeed: number;
	acceleration: number;
	damaged: boolean;
	useBrain: boolean;
	controls: Controls;
	brain?: Network;
	sensor?: Sensor;
};

export type Coord = {
	x: number;
	y: number;
	offset?: number;
};
