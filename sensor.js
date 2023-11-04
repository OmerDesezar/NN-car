class Sensor {
  constructor(car) {
    this.car = car;
    this.rayCount = 11;
    this.rayLength = 100;
    this.raySpread = Math.PI * 1.5;
    this.rays = [];
    this.readings = [];
  }

  update(roadBorders, traffic) {
    this.#castRays();
    this.#getReadings(roadBorders, traffic);
  }

  draw(ctx) {
    for (let i = 0; i < this.rays.length; i++) {
      const end = this.readings[i] ? this.readings[i] : this.rays[i][1];

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "Yellow";
      ctx.moveTo(this.rays[i][0].x, this.rays[i][0].y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "Black";
      ctx.moveTo(this.rays[i][1].x, this.rays[i][1].y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }
  }

  #castRays() {
    this.rays = [];
    for (let i = 0; i < this.rayCount; i++) {
      const rayAngle =
        lerp(
          this.raySpread / 2,
          -this.raySpread / 2,
          this.rayCount == 1 ? 0.5 : i / (this.rayCount - 1)
        ) + this.car.angle;

      const start = { x: this.car.x, y: this.car.y };
      const end = {
        x: start.x - Math.sin(rayAngle) * this.rayLength,
        y: start.y - Math.cos(rayAngle) * this.rayLength,
      };
      this.rays.push([start, end]);
    }
  }

  #getReadings(roadBorders, traffic) {
    this.readings = [];
    this.rays.forEach((ray) =>
      this.readings.push(this.#getReading(ray, roadBorders, traffic))
    );
  }

  #getReading(ray, roadBorders, traffic) {
    const touches = [];
    roadBorders.forEach((roadBorder) => {
      const touch = getIntersection(
        ray[0],
        ray[1],
        roadBorder[0],
        roadBorder[1]
      );
      if (touch) touches.push(touch);
    });
    traffic.forEach((trafficCar) => {
      for (let i = 0; i < trafficCar.polygon.length; i++) {
        const touch = getIntersection(
          ray[0],
          ray[1],
          trafficCar.polygon[i],
          trafficCar.polygon[(i + 1) % trafficCar.polygon.length]
        );
        if (touch) touches.push(touch);
      }
    });
    if (0 == touches.length) return null;
    return touches.reduce((prev, curr) =>
      prev.offset < curr.offset ? prev : curr
    );
  }
}
