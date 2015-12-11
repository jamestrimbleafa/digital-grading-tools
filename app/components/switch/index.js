import model from './model';
import view from './view';
import intent from './intent';

import {pluck} from '../../lib/utils';

export default (responses) => {
  const {
    DOM,
    props$,
  } = responses;

  const enabled$ = props$.map(pluck('enabled')).startWith(false);

  const state$ = model(enabled$, intent(DOM));
  const vtree$ = view(state$);

  return {
    DOM: vtree$,
    enabled$: state$.map(pluck('enabled')),
  };
};