import {div, strong} from '@cycle/dom';
import calcCosts from '../lib/costs';

export default (pla) => {
  const costs = calcCosts(pla);

  const gate = costs.gates === 1 ? 'gate' : 'gates';
  const inputs = costs.inputs === 1 ? 'input' : 'inputs';

  return div('.stage-bar', [
    strong('Costs:'),
    ` ${costs.gates} ${gate} with ${costs.inputs} ${inputs}`,
  ]);
};
