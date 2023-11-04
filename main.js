const carCanvas = document.getElementById("carCanvas");
const networkCanvas = document.getElementById("networkCanvas");
carCanvas.width = 300;
networkCanvas.width = 900;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9, 5);

let cars = generateCars(1500);
let bestCar = cars[0];
setCarsBrain();

let traffic = [];
let minTrafficWaveSpawn = 1;
let spawnCarsInterval = 4000;
let trafficCarSpeedModifier = 0;

let intervalID;
let level = 1;

setGameInterval();
startTutorial();
animate();

function animate(time) {
  // if (time / 20000 > level) levelUp();
  bestCar = cars.reduce((prev, curr) => (prev.y < curr.y ? prev : curr));
  traffic.forEach((trafficCar) => trafficCar.update());
  cars.forEach((car) => car.update(road.borders, traffic));
  carCanvas.height = window.innerHeight;
  networkCanvas.height = window.innerHeight;
  carCtx.save();
  carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);
  road.draw(carCtx);
  traffic.forEach((trafficCar) => trafficCar.draw(carCtx, "red"));
  carCtx.globalAlpha = 0.2;
  cars.forEach((car) => car.draw(carCtx, "blue", false));
  carCtx.globalAlpha = 1;
  bestCar.draw(carCtx, "blue", true);
  carCtx.restore();
  networkCtx.lineDashOffset = -time / 50;
  Visualizer.drawNetwork(networkCtx, bestCar.brain);
  requestAnimationFrame(animate);
}

function generateCars(numOfCars) {
  const arr = [];
  for (let i = 0; i < numOfCars; i++) {
    arr.push(new Car(road.getLaneCenter(2), 100, 30, 50, 3, 0.2, "AI"));
  }
  return arr;
}

function setCarsBrain() {
  if (localStorage.getItem("bestBrain")) {
    cars.forEach((car) => {
      car.brain = JSON.parse(localStorage.getItem("bestBrain"));
      if (car != bestCar) NeuralNetwork.mutateBrain(car.brain, 0.2);
    });
  }
}

function filterUselessCars() {
  cars = cars.filter(
    (car) =>
      car.y - bestCar.y < 250 && car.speed > car.maxSpeed * 0.9 && !car.damaged
  );
  traffic = traffic.filter((car) => car.y - bestCar.y < 1500);
}

function startTutorial() {
  traffic = [
    new Car(road.getLaneCenter(2), -300, 30, 50, 2, 0.2, "DUMMY"),
    new Car(road.getLaneCenter(1), -600, 30, 50, 2, 0.2, "DUMMY"),
    new Car(road.getLaneCenter(3), -600, 30, 50, 2, 0.2, "DUMMY"),
    new Car(road.getLaneCenter(1), -900, 30, 50, 2, 0.2, "DUMMY"),
    new Car(road.getLaneCenter(2), -900, 30, 50, 2, 0.2, "DUMMY"),
    new Car(road.getLaneCenter(3), -900, 30, 50, 2, 0.2, "DUMMY"),
    new Car(road.getLaneCenter(0), -1200, 30, 50, 2, 0.2, "DUMMY"),
    new Car(road.getLaneCenter(1), -1200, 30, 50, 2, 0.2, "DUMMY"),
    new Car(road.getLaneCenter(3), -1200, 30, 50, 2, 0.2, "DUMMY"),
    new Car(road.getLaneCenter(4), -1200, 30, 50, 2, 0.2, "DUMMY"),
  ];

  setTimeout(() => {
    console.log("starting real game");
    intervalID = setTrafficInterval();
  }, 27000);
}

function spawnTraffic() {
  const numOfCarsToSpawn = generateNumbersInRange(
    minTrafficWaveSpawn,
    road.laneCount - 1,
    1
  )[0];
  const carLanes = generateNumbersInRange(
    0,
    road.laneCount - 1,
    numOfCarsToSpawn
  );

  carLanes.forEach((laneNum) =>
    traffic.push(
      new Car(
        road.getLaneCenter(laneNum),
        bestCar.y - 750,
        30,
        50,
        2 - (Math.random() * 1.5 - 0.25) * trafficCarSpeedModifier,
        0.2,
        "DUMMY"
      )
    )
  );
}

function levelUp() {
  level++;
  console.log("level: ", level);
  switch (Math.round(Math.random() * 2)) {
    case 0:
      clearInterval(intervalID);
      spawnCarsInterval = Math.max(1500, spawnCarsInterval - 250);
      intervalID = setTrafficInterval();
      break;
    case 1:
      minTrafficWaveSpawn = Math.min(
        road.laneCount - 1,
        minTrafficWaveSpawn + Math.round(Math.random() * 0.75)
      );
      break;
    case 2:
      trafficCarSpeedModifier = Math.min(2, trafficCarSpeedModifier + 0.25);
  }
  console.log(`wave interval: ${spawnCarsInterval / 1000} seconds`);
  console.log(`spawn range: ${minTrafficWaveSpawn} - ${road.laneCount - 1}`);
  console.log(`traffic speed modifier: ${trafficCarSpeedModifier}`);
  console.log(`alive: ${cars.filter((car) => !car.damaged).length} cars`);
}

function saveBestBrain() {
  console.log("saved");
  localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
  localStorage.setItem("bestBrainFitness", -bestCar.y);
}

function discard() {
  console.log("discarded");
  localStorage.removeItem("bestBrain");
  localStorage.removeItem("bestBrainFitness");
}

function setGameInterval() {
  setInterval(() => {
    filterUselessCars();
    if (0 == cars.length) {
      const bestPrevFitness = localStorage.getItem("bestBrainFitness");
      console.log(-bestCar.y);
      if (
        (!bestPrevFitness && -bestCar.y > 1500) ||
        (bestPrevFitness && -bestCar.y > bestPrevFitness + 1000)
      ) {
        saveBestBrain();
      }
      window.location.reload();
    }
  }, 1000);
}

function setTrafficInterval() {
  setInterval(() => {
    spawnTraffic();
  }, spawnCarsInterval);
}
