import './style.less';
import {onEvent, send} from './lib/api';
import {stage} from './app';
import renderFamilies from './render/families';
import {getFontRatio} from './theme';

onEvent((e) => {
	switch (e.type) {
	case 'families':
		renderFamilies(stage, e.families)
		break;
	}
});

send('ready', {
	fontRatio: getFontRatio(),
});