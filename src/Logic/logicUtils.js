export const lerp = (A, B, t) => A + (B - A) * t;

export const getIntersection = (A, B, C, D) => {
	const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
	const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
	const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

	if (0 !== bottom) {
		const t = tTop / bottom;
		const u = uTop / bottom;
		if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
			return {
				x: lerp(A.x, B.x, t),
				y: lerp(A.y, B.y, t),
				offset: t,
			};
		}
	}
	return null;
};

export const polyIntersect = (poly1, poly2) => {
	for (let i = 0; i < poly1.length; i++) {
		for (let j = 0; j < poly2.length; j++) {
			const touch = getIntersection(
				poly1[i],
				poly1[(i + 1) % poly1.length],
				poly2[j],
				poly2[(j + 1) % poly2.length]
			);
			if (touch) return true;
		}
	}
	return false;
};

export const getRGBA = (value) => {
	const alpha = Math.abs(value);
	const R = value < 0 ? 0 : 255;
	const G = R;
	const B = value > 0 ? 0 : 255;
	return `rgba(${R},${G},${B},${alpha})`;
};

export function generateNumbersInRange(min, max, amount) {
	const numbers = [];

	while (numbers.length < amount) {
		const number = Math.floor(Math.random() * (max - min + 1)) + min;
		if (!numbers.includes(number)) {
			numbers.push(number);
		}
	}

	return numbers;
}
