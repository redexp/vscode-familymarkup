import './style.less';
import {onEvent, send} from './lib/api';
import {renderFamilies, getFontRatio} from './app';

onEvent((e) => {
	switch (e.type) {
	case 'families':
		renderFamilies(e.families)
		break;
	}
});

send('ready', {
	fontRatio: getFontRatio(),
}).catch(err => {
	console.error('send ready', err);
});