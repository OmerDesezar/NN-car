import { Box, Typography } from "@mui/material";
import { Canvas } from "./Components/Canvas";
import {
  drawNetwork,
  drawSimulation,
  startSimulation,
} from "./Logic/mainLogic";

export const App = () => {
  document.body.style = "background: #001E3C; margin: 0; overflow: hidden;";

  startSimulation();

  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      alignItems={"center"}
      height={window.innerHeight}
    >
      <Typography variant="h1" color={"#90caf9"}>
        Neural-Network Driven Cars
      </Typography>
      <Box
        display={"flex"}
        justifyContent={"space-around"}
        width={"100%"}
        height={"88%"}
      >
        <Canvas draw={drawSimulation} />
        <Canvas draw={drawNetwork} />
      </Box>
    </Box>
  );
};
