import { ControlType, Controls } from "../types";

export const makeControls = (type: ControlType): Controls => {
	// "KEYS" === type && addKeyboardListeners();
	return {
		forward: "DUMMY" === type,
		reverse: false,
		left: false,
		right: false,
	};
};

const addKeyboardListeners = (controls: Controls) => {
	document.onkeydown = ({ key }) => setMovement(controls, key, true);
	document.onkeyup = ({ key }) => setMovement(controls, key, false);
};

const setMovement = (controls: Controls, key: string, bool: boolean): void => {
	if (key === "ArrowUp") controls.forward = bool;
	if (key === "ArrowDown") controls.reverse = bool;
	if (key === "ArrowLeft") controls.left = bool;
	if (key === "ArrowRight") controls.right = bool;
};
