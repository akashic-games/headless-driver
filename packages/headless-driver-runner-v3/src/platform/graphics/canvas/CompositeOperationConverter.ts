import { akashicEngine as g } from "../../../engineFiles";

export type CompositeOperation =
	| "source-atop"
	| "lighter"
	| "copy"
	| "source-in"
	| "source-out"
	| "destination-atop"
	| "destination-in"
	| "destination-out"
	| "destination-over"
	| "xor"
	| "source-over";

export class CompositeOperationConverter {
	static toEngine(operation: CompositeOperation): g.CompositeOperationString {
		if (operation === "source-over") {
			return "source-over";
		} else if (operation === "source-atop") {
			return "source-atop";
		} else if (operation === "lighter") {
			return "lighter";
		} else if (operation === "copy") {
			return "copy";
		} else if (operation === "destination-out") {
			return "destination-out";
		} else if (operation === "destination-over") {
			return "destination-over";
		} else if (operation === "xor") {
			return "xor";
		} else if (operation === "source-in") {
			return "experimental-source-in";
		} else if (operation === "source-out") {
			return "experimental-source-out";
		} else if (operation === "destination-in") {
			return "experimental-destination-in";
		} else if (operation === "destination-atop") {
			return "experimental-destination-atop";
		}
		throw new Error(`unknown composite operation: ${operation}`);
	}

	static toContext2D(operation: g.CompositeOperationString): CompositeOperation {
		if (operation === "source-over") {
			return "source-over";
		} else if (operation === "source-atop") {
			return "source-atop";
		} else if (operation === "lighter") {
			return "lighter";
		} else if (operation === "copy") {
			return "copy";
		} else if (operation === "destination-out") {
			return "destination-out";
		} else if (operation === "destination-over") {
			return "destination-over";
		} else if (operation === "xor") {
			return "xor";
		} else if (operation === "experimental-source-in") {
			return "source-in";
		} else if (operation === "experimental-source-out") {
			return "source-out";
		} else if (operation === "experimental-destination-in") {
			return "destination-in";
		} else if (operation === "experimental-destination-atop") {
			return "destination-atop";
		}
		throw new Error(`unknown composite operation: ${operation}`);
	}
}
