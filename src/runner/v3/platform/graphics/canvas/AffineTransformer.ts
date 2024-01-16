export class AffineTransformer {
	//
	//            a b 0
	// matrix = [ c d 0 ]
	//            e f 1
	//
	// 配列としては [a, b, c, d, e, f] と値を持っている。
	matrix: Float32Array;

	constructor(rhs?: AffineTransformer) {
		if (rhs) {
			this.matrix = new Float32Array(rhs.matrix);
		} else {
			this.matrix = new Float32Array([1, 0, 0, 1, 0, 0]);
		}
	}

	scale(x: number, y: number): AffineTransformer {
		const m = this.matrix;

		m[0] *= x;
		m[1] *= x;
		m[2] *= y;
		m[3] *= y;

		return this;
	}

	translate(x: number, y: number): AffineTransformer {
		const m = this.matrix;

		m[4] += m[0] * x + m[2] * y;
		m[5] += m[1] * x + m[3] * y;

		return this;
	}

	transform(matrix: number[]): AffineTransformer {
		const m = this.matrix;

		const a = matrix[0] * m[0] + matrix[1] * m[2];
		const b = matrix[0] * m[1] + matrix[1] * m[3];
		const c = matrix[2] * m[0] + matrix[3] * m[2];
		const d = matrix[2] * m[1] + matrix[3] * m[3];
		const e = matrix[4] * m[0] + matrix[5] * m[2] + m[4];
		const f = matrix[4] * m[1] + matrix[5] * m[3] + m[5];

		m[0] = a;
		m[1] = b;
		m[2] = c;
		m[3] = d;
		m[4] = e;
		m[5] = f;

		return this;
	}

	setTransform(matrix: number[]): void {
		const m = this.matrix;

		m[0] = matrix[0];
		m[1] = matrix[1];
		m[2] = matrix[2];
		m[3] = matrix[3];
		m[4] = matrix[4];
		m[5] = matrix[5];
	}

	copyFrom(rhs: AffineTransformer): AffineTransformer {
		this.matrix.set(rhs.matrix);
		return this;
	}
}
