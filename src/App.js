import { Box, Typography } from "@mui/material";
import { Canvas } from "./Components/Canvas";
import { init } from "./Logic/mainLogic";
import { drawFirstCarNetwork } from "./Logic/networkLogic";
import { drawSimulation, restartSimulation } from "./Logic/carLogic";
import png from "./Assets/bg.jpg";
import { Options } from "./Components/Options";

export const App = () => {
	document.body.style = "margin: 0";

	init();
	restartSimulation();

	return (
		<Box
			display={"flex"}
			sx={{ backgroundImage: `url(${png})` }}
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
				<Canvas draw={drawSimulation} />
				<Options />
				<Canvas draw={drawFirstCarNetwork} />
			</Box>
		</Box>
	);
};
