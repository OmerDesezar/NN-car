import React, { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { Canvas } from "./Components/Canvas";
import {
	drawFirstCarNetwork,
	drawCarSim,
} from "./Logic/CarSimulation/carLogic";
import png from "./Assets/bg.jpg";
import { Options } from "./Components/Options";
import { init } from "./Logic/CarSimulation/carSimEntry";

export const App = () => {
	document.body.style = "margin: 0";

	useEffect(init, []);

	return (
		<Box
			display={"flex"}
			sx={{ backgroundImage: `url(${png})`, backgroundSize: "100% 100%" }}
			flexDirection={"column"}
			alignItems={"center"}
			height={window.innerHeight}
		>
			<Typography
				sx={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "1rem" }}
				variant='h1'
				color={"#90caf9"}
			>
				Neural-Network Driven Cars
			</Typography>
			<Box
				display={"flex"}
				justifyContent={"space-evenly"}
				width={"100%"}
				height={"88%"}
			>
				<Canvas draw={drawCarSim} />
				<Options />
				<Canvas draw={drawFirstCarNetwork} />
			</Box>
		</Box>
	);
};
