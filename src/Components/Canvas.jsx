import React, { useRef, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { SIMULATION_WIDTH } from "../Logic/MainLogic";

const StyledCanvas = styled("canvas")({
	backgroundColor: "gray",
	width: SIMULATION_WIDTH,
});

export const Canvas = ({ draw }) => {
	const canvasRef = useRef(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		const context = canvas.getContext("2d");
		let frameCount = 0;
		let animationFrameId;

		const render = (time) => {
			frameCount++;
			draw(context, time, frameCount);
			animationFrameId = window.requestAnimationFrame(render);
		};
		render();

		return () => window.cancelAnimationFrame(animationFrameId);
	}, [draw]);

	return <StyledCanvas ref={canvasRef} />;
};
