import {Subject} from 'rx';
import isolate from '@cycle/isolate';

import model from './model';
import view from './view';
import intent from './intent';
import toTable from './lib/table';

import TableComponent from '../table';

export default ({
  DOM, // DOM driver source
  globalEvents, // globalEvent driver sources
  data$,
}) => {
  const selectedRow$ = new Subject();

  const actions = intent({
    DOM,
    globalEvents,
    selectIndex$: selectedRow$,
  });
  const state$ = model(data$, actions);
  const table$ = state$.map(toTable);

  const tableComponent = isolate(TableComponent)({
    DOM,
    table$,
  });

  tableComponent.selectedRow$.subscribe(selectedRow$);

  const vtree$ = view(state$, tableComponent.DOM);

  return {
    DOM: vtree$,
    preventDefault: actions.preventDefault,
  };
};
