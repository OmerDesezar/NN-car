import { Box, Typography } from "@mui/material";
import { Canvas } from "./Components/Canvas";

export const App = () => {
  document.body.style = "background: #001E3C; margin: 0; overflow: hidden;";

  const draw = (ctx, frameCount) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(50, 100, 20 * Math.sin(frameCount * 0.05) ** 2, 0, 2 * Math.PI);
    ctx.fill();
  };

  return (
    <Box display={"flex"} flexDirection={"column"} alignItems={"center"}>
      <Typography variant="h1" color={"#90caf9"}>
        Neural-Network Driven Cars
      </Typography>
      <Box display={"flex"} justifyContent={"space-around"} width={"100%"}>
        <Canvas draw={draw} />
        <Canvas draw={draw} />
      </Box>
    </Box>
  );
};
