import React, { useRef, useEffect } from "react";
import { styled } from "@mui/material/styles";

const StyledCanvas = styled("canvas")({
  backgroundColor: "gray",
  width: "45%",
  height: "100%",
});

export const Canvas = ({ draw }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    let frameCount = 0;
    let animationFrameId;

    const render = () => {
      frameCount++;
      draw(context, frameCount);
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    return () => window.cancelAnimationFrame(animationFrameId);
  }, []);

  return <StyledCanvas ref={canvasRef} />;
};
