import { Network, NetworkLevel } from "../types";
import { getFirstCar } from "./carLogic";
import { getRGBA, lerp } from "./logicUtils";

export const makeNetwork = (neuronCount: number[]): Network => {
	const network: Network = { levels: [] };
	for (let i = 0; i < neuronCount.length - 1; i++) {
		network.levels.push(makeLevel(neuronCount[i], neuronCount[i + 1]));
	}
	return network;
};

const makeLevel = (inputCount: number, outputCount: number): NetworkLevel => {
	const level: NetworkLevel = {
		inputs: new Array(inputCount),
		outputs: new Array(outputCount),
		biases: new Array(outputCount),
		weights: [],
	};
	for (let i = 0; i < inputCount; i++) {
		level.weights[i] = new Array(outputCount);
	}
	randomizeLevel(level);
	return level;
};

const randomizeLevel = (level: NetworkLevel): void => {
	for (let i = 0; i < level.inputs.length; i++) {
		for (let j = 0; j < level.outputs.length; j++) {
			level.weights[i][j] = Math.random() * 2 - 1;
		}
	}
	for (let i = 0; i < level.biases.length; i++) {
		level.biases[i] = Math.random() * 2 - 1;
	}
};

const levelFeedForward = (
	givenInputs: number[],
	level: NetworkLevel
): number[] => {
	for (let i = 0; i < level.inputs.length; i++) {
		level.inputs[i] = givenInputs[i];
	}
	for (let i = 0; i < level.outputs.length; i++) {
		let sum = 0;
		for (let j = 0; j < level.inputs.length; j++) {
			sum += level.inputs[j] * level.weights[j][i];
		}
		sum -= level.biases[i];
		level.outputs[i] = 1 / (1 + Math.exp(-sum));
	}
	return level.outputs;
};

export const networkFeedForward = (
	givenInputs: number[],
	network: Network
): number[] => {
	let outputs = levelFeedForward(givenInputs, network.levels[0]);
	for (let i = 1; i < network.levels.length; i++) {
		outputs = levelFeedForward(outputs, network.levels[i]);
	}
	network.levels[network.levels.length - 1].outputs = outputs.map((output) =>
		output > 0.5 ? 1 : 0
	);
	return network.levels[network.levels.length - 1].outputs;
};

export const mutateNetwork = (network: Network, amount: number = 1): void => {
	network.levels.forEach((level) => {
		for (let i = 0; i < level.biases.length; i++) {
			level.biases[i] = lerp(level.biases[i], Math.random() * 2 - 1, amount);
		}
		for (let i = 0; i < level.weights.length; i++) {
			for (let j = 0; j < level.weights[i].length; j++) {
				level.weights[i][j] = lerp(
					level.weights[i][j],
					Math.random() * 2 - 1,
					amount
				);
			}
		}
	});
};

export const drawFirstCarNetwork = (ctx, time, frameCount) => {
	ctx.reset();
	ctx.canvas.height = window.innerHeight * 0.5;
	ctx.lineDashOffset = -time / 50;
	drawNetwork(ctx, getFirstCar().brain);
};

export const drawNetwork = (ctx: any, network: Network): void => {
	const margin = 30;
	const left = margin;
	const top = margin;
	const width = ctx.canvas.width - margin * 2;
	const height = ctx.canvas.height - margin * 2;

	const levelHeight = height / network.levels.length;
	for (let i = network.levels.length - 1; i >= 0; i--) {
		const levelTop =
			top +
			lerp(
				height - levelHeight,
				0,
				network.levels.length === 1 ? 0.5 : i / (network.levels.length - 1)
			);
		ctx.setLineDash([7, 3]);
		drawNetworkLevel(
			ctx,
			network.levels[i],
			left,
			levelTop,
			width,
			levelHeight,
			i === network.levels.length - 1 ? ["🡹", "🡸", "🡺", "🡻"] : []
		);
	}
};

const drawNetworkLevel = (
	ctx: any,
	level: NetworkLevel,
	left: number,
	top: number,
	width: number,
	height: number,
	icons: string[]
): void => {
	const right = left + width;
	const bottom = top + height;
	const nodeRadius = 12;
	const { inputs, outputs, weights, biases } = level;
	for (let i = 0; i < inputs.length; i++) {
		for (let j = 0; j < outputs.length; j++) {
			ctx.beginPath();
			ctx.moveTo(getNodeX(i, left, right, inputs.length), bottom);
			ctx.lineTo(getNodeX(j, left, right, outputs.length), top);
			ctx.lineWidth = 2;
			ctx.strokeStyle = getRGBA(weights[i][j]);
			ctx.stroke();
		}
	}
	for (let i = 0; i < inputs.length; i++) {
		const x = getNodeX(i, left, right, inputs.length);
		ctx.beginPath();
		ctx.arc(x, bottom, nodeRadius * 1.5, 0, Math.PI * 2);
		ctx.fillStyle = "black";
		ctx.fill();
		ctx.beginPath();
		ctx.arc(x, bottom, nodeRadius, 0, Math.PI * 2);
		ctx.fillStyle = getRGBA(inputs[i]);
		ctx.fill();
	}
	for (let i = 0; i < outputs.length; i++) {
		const x = getNodeX(i, left, right, outputs.length);
		ctx.beginPath();
		ctx.arc(x, top, nodeRadius * 1.5, 0, Math.PI * 2);
		ctx.fillStyle = "black";
		ctx.fill();
		ctx.beginPath();
		ctx.arc(x, top, nodeRadius, 0, Math.PI * 2);
		ctx.fillStyle = getRGBA(outputs[i]);
		ctx.fill();

		ctx.beginPath();
		ctx.lineWidth = 2;
		ctx.arc(x, top, nodeRadius * 1.3, 0, Math.PI * 2);
		ctx.strokeStyle = getRGBA(biases[i]);
		ctx.setLineDash([3, 3]);
		ctx.stroke();
		ctx.setLineDash([]);

		if (icons[i]) {
			ctx.beginPath();
			ctx.textAlign = "center";
			ctx.textBaseLine = "middle";
			ctx.fillStyle = "black";
			ctx.strokeStyle = "white";
			ctx.font = nodeRadius * 1.5 + "px Ariel";
			ctx.fillText(icons[i], x, top + 6);
			ctx.lineWidth = 0.5;
			ctx.strokeText(icons[i], x, top + 6);
		}
	}
};

const getNodeX = (i: number, left: number, right: number, len: number) => {
	return lerp(left, right, len === 1 ? 0.5 : i / (len - 1));
};
