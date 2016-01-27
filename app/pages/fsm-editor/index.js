import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver, div} from '@cycle/dom';
import isolate from '@cycle/isolate';
import {makeHammerDriver} from '@cyclic/cycle-hammer-driver';

import {preventDefaultDriver} from '../../drivers/prevent-default';
import {keyboardDriver} from '../../drivers/keyboard';
import {autoResizeDriver} from '../../drivers/textarea-resize';
import {selectAllDriver} from '../../drivers/select-all';

import FSMComponent from '../../components/fsm';
import GraphComponent from '../../components/graph';
import splitPane from '../../components/splitpane';

const fsmEditor = (sources) => {
  const {
    DOM,
    preventDefault,
    keydown,
  } = sources;

  const fsmComponent = isolate(FSMComponent)({
    DOM,
    keydown,
  });

  const graphComponent = isolate(GraphComponent)({
    DOM,
    keydown,
    data$: fsmComponent.graph$,
  });

  const leftDOM = fsmComponent.DOM;
  const rightDOM = graphComponent.DOM;

  const splitComponent = isolate(splitPane)({
    DOM,
    preventDefault,
    keydown,
    props$: O.just({proportion: 0.65}),
    firstChild$: leftDOM,
    secondChild$: rightDOM,
  });

  return {
    DOM: splitComponent.DOM,
    preventDefault: O.merge(
      fsmComponent.preventDefault,
      graphComponent.preventDefault,
      splitComponent.preventDefault
    ),
    selectAll: O.empty(),
    autoResize: O.empty(),
  };
};

const drivers = {
  DOM: makeHammerDriver(makeDOMDriver('#app')),
  preventDefault: preventDefaultDriver,
  keydown: keyboardDriver,
  autoResize: autoResizeDriver,
  selectAll: selectAllDriver,
};

Cycle.run(fsmEditor, drivers);