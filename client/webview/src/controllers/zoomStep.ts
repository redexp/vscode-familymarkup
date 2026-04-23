import type {G} from '@svgdotjs/svg.js';

let step: ZoomStep = 'normal';

export default function zoomStep(zoom: number, stage: G) {
	let curStep: ZoomStep = 'normal';

	if (zoom <= 0.11) {
		curStep = 'min';
	}
	else if (zoom <= 0.4) {
		curStep = 'xs';
	}
	else if (zoom <= 0.7) {
		curStep = 'sm';
	}

	if (curStep === step) return;

	step = curStep;

	stage.attr('data-zoom-step', step);
	stage.dispatch('zoom-step', {step});
}

export function getZoomStep(): ZoomStep {
	return step;
}

export type ZoomStep = 'min' | 'xs' | 'sm' | 'normal';

export type ZoomStepEvent = CustomEvent<{step: ZoomStep}>;