import { akashicEngine as g } from "@akashic/engine-files";

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
		let operationText: g.CompositeOperationString;
		if (operation === "source-over") {
			operationText = "source-over";
		} else if (operation === "source-atop") {
			operationText = "source-atop";
		} else if (operation === "lighter") {
			operationText = "lighter";
		} else if (operation === "copy") {
			operationText = "copy";
		} else if (operation === "destination-out") {
			operationText = "destination-out";
		} else if (operation === "destination-over") {
			operationText = "destination-over";
		} else if (operation === "xor") {
			operationText = "xor";
		} else if (operation === "source-in") {
			operationText = "experimental-source-in";
		} else if (operation === "source-out") {
			operationText = "experimental-source-out";
		} else if (operation === "destination-in") {
			operationText = "experimental-destination-in";
		} else if (operation === "destination-atop") {
			operationText = "experimental-destination-atop";
		} else {
			throw new Error(`unknown type: ${operation}`);
		}
		return operationText;
	}

	static toContext2D(operation: g.CompositeOperationString): CompositeOperation {
		let operationText: CompositeOperation;
		if (operation === "source-over") {
			operationText = "source-over";
		} else if (operation === "source-atop") {
			operationText = "source-atop";
		} else if (operation === "lighter") {
			operationText = "lighter";
		} else if (operation === "copy") {
			operationText = "copy";
		} else if (operation === "destination-out") {
			operationText = "destination-out";
		} else if (operation === "destination-over") {
			operationText = "destination-over";
		} else if (operation === "xor") {
			operationText = "xor";
		} else if (operation === "experimental-source-in") {
			operationText = "source-in";
		} else if (operation === "experimental-source-out") {
			operationText = "source-out";
		} else if (operation === "experimental-destination-in") {
			operationText = "destination-in";
		} else if (operation === "experimental-destination-atop") {
			operationText = "destination-atop";
		} else {
			throw new Error(`unknown type: ${operation}`);
		}
		return operationText;
	}
}
