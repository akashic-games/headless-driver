import { Permission } from "@akashic/amflow";

export const activePermission: Permission = {
	readTick: true,
	writeTick: true,
	sendEvent: true,
	subscribeEvent: true,
	subscribeTick: true,
	maxEventPriority: 2
};

export const passivePermission: Permission = {
	readTick: true,
	writeTick: false,
	sendEvent: true,
	subscribeEvent: false,
	subscribeTick: false,
	maxEventPriority: 2
};
