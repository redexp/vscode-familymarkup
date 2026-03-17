import type {Loc} from "../types";

let vscode;

const listeners: Listener[] = [];

window.addEventListener('message', function ({data: e}) {
	trigger(e);
});

export type WebViewEvent = {
	type: string,
	[prop: string]: any,
};

export type Listener = (e: WebViewEvent) => void;

function trigger(e: any) {
	for (const listener of listeners) {
		listener(e);
	}
}

export function onEvent(cb: Listener) {
	listeners.push(cb);
}

export async function send(type: string, data?: any) {
	// @ts-ignore
	if (import.meta.env?.DEV) {
		if (type !== 'ready') return;

		const {families} = await import('../dev/data');
		trigger({type: 'document', families});
		return;
	}

	if (!vscode) {
		vscode = acquireVsCodeApi();
	}

	vscode.postMessage({
		...data,
		type,
	});
}

export function open(uri: string, loc: Loc) {
	return send('open', {
		uri,
		...loc.start,
	});
}