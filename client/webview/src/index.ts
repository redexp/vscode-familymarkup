import './style.less';
import {onEvent, send} from './lib/api';
import renderFamilies from './render/families';
import {getFontRatio} from './theme';

onEvent((e) => {
	switch (e.type) {
	case 'families':
		renderFamilies(e.families)
		break;
	}
});

send('ready', {
	fontRatio: getFontRatio(),
});