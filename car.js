class Car {
  constructor(
    x,
    y,
    width,
    height,
    maxSpeed = 3,
    acceleration = 0.2,
    type = "DUMMY"
  ) {
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;

    this.speed = 0;
    this.angle = 0;
    this.friction = 0.05;
    this.turn = 0.03;
    this.maxSpeed = maxSpeed;
    this.acceleration = acceleration;
    this.damaged = false;
    this.useBrain = "AI" == type;

    if ("DUMMY" != type) {
      this.sensor = new Sensor(this);
      this.brain = new NeuralNetwork([this.sensor.rayCount, 7, 4]);
    }
    this.controls = new Controls(type);
  }

  update(roadBorders = [], traffic = []) {
    if (!this.damaged) {
      this.#move();
      this.polygon = this.#createPolygon();
      this.damaged = this.#assessDamage(roadBorders, traffic);
    }
    if (this.sensor) {
      this.sensor.update(roadBorders, traffic);
      const offsets = this.sensor.readings.map((r) =>
        null == r ? 0 : 1 - r.offset
      );
      const outputs = NeuralNetwork.feedForward(offsets, this.brain);
      if (this.useBrain) {
        this.controls.forward = outputs[0];
        this.controls.left = outputs[1];
        this.controls.right = outputs[2];
        this.controls.reverse = outputs[3];
      }
    }
  }

  draw(ctx, color = "black", drawSensor) {
    if (this.damaged) ctx.fillStyle = "gray";
    else ctx.fillStyle = color;
    if (this.sensor && drawSensor) {
      this.sensor.draw(ctx);
    }
    ctx.beginPath();
    ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
    for (let i = 1; i < this.polygon.length; i++) {
      ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
    }
    ctx.fill();
  }

  #move() {
    const flip = this.speed > 0 ? 1 : this.speed < 0 ? -1 : 0;
    if (this.controls.forward) this.speed += this.acceleration;
    if (this.controls.reverse) this.speed -= this.acceleration;
    if (this.controls.left) this.angle += this.turn * flip;
    if (this.controls.right) this.angle -= this.turn * flip;
    if (this.speed > this.maxSpeed) this.speed = this.maxSpeed;
    if (this.speed < -this.maxSpeed / 2) this.speed = -this.maxSpeed / 2;
    if (Math.abs(this.speed) < this.friction) this.speed = 0;
    if (Math.abs(this.speed) > 0) this.speed -= this.friction * flip;
    this.x -= Math.sin(this.angle) * this.speed;
    this.y -= Math.cos(this.angle) * this.speed;
  }

  #createPolygon() {
    const points = [];
    const rad = Math.hypot(this.width, this.height) / 2;
    const alpha = Math.atan2(this.width, this.height);
    points.push({
      x: this.x - Math.sin(this.angle - alpha) * rad,
      y: this.y - Math.cos(this.angle - alpha) * rad,
    });
    points.push({
      x: this.x - Math.sin(this.angle + alpha) * rad,
      y: this.y - Math.cos(this.angle + alpha) * rad,
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad,
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad,
    });
    return points;
  }

  #assessDamage(roadBorders, traffic) {
    return (
      roadBorders.some((roadBorder) =>
        polyIntersect(this.polygon, roadBorder)
      ) ||
      traffic.some((trafficCar) =>
        polyIntersect(this.polygon, trafficCar.polygon)
      )
    );
  }
}
