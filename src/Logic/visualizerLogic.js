import { getRGBA, lerp } from "./logicUtils";

export const drawVisualizer = (ctx, network) => {
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
    drawLevel(
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

const drawLevel = (ctx, level, left, top, width, height, icons) => {
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

const getNodeX = (i, left, right, len) => {
  return lerp(left, right, len === 1 ? 0.5 : i / (len - 1));
};
