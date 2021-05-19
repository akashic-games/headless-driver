import { StartPoint } from "@akashic/amflow";
import { TickList } from "@akashic/playlog";

export interface DumpedPlaylog {
	tickList: TickList | null;
	startPoints: StartPoint[];
}
