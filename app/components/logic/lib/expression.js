import I from 'immutable';

const row = I.Record({
  identifierValues: I.Map(),
  values: I.List(),
});

const labeledExpression = I.Record({
  location: null,
  name: null,
  content: null,
}, 'labeledExpression');

const expressionUnion = I.Record({
  node: null,
  operator: null,
  operand: null,
  lhs: null,
  rhs: null,
  content: null,
  name: null,
  style: null,
  value: null,
  vectorIdentifiers: null,
  vectorValues: null,
}, 'expressionUnion');

export const expressionFromJson = (data) => {
  if (data === null) {
    return null;
  }

  switch (data.node) {
  case 'label':
    return labeledExpression({
      location: data.location,
      name: data.name,
      content: expressionFromJson(data.content),
    });
  case 'binary':
    return expressionUnion({
      node: data.node.toString(),
      operator: data.operator.toString(),
      lhs: expressionFromJson(data.lhs),
      rhs: expressionFromJson(data.rhs),
    });
  case 'unary':
    return expressionUnion({
      node: data.node.toString(),
      operator: data.operator.toString(),
      operand: expressionFromJson(data.operand),
    });
  case 'group':
    return expressionUnion({
      node: data.node.toString(),
      content: expressionFromJson(data.content),
      style: data.style,
    });
  case 'identifier':
    return expressionUnion({
      node: data.node.toString(),
      name: data.name.toString(),
    });
  case 'constant':
    return expressionUnion({
      node: data.node.toString(),
      value: data.value,
    });
  case 'vector':
    return expressionUnion({
      node: data.node.toString(),
      vectorIdentifiers: data.vector.identifiers.map(expressionFromJson),
      vectorValues: I.List(data.vector.values),
    });
  default:
    throw new Error(`unknown node: ${data}`);
  }
};

export const evalBinary = (expression, identifierMap, evalExpr) => {
  switch (expression.operator) {
  case 'AND':
    return evalExpr(expression.lhs, identifierMap) &&
      evalExpr(expression.rhs, identifierMap)
    ;
  case 'OR':
    return evalExpr(expression.lhs, identifierMap) ||
      evalExpr(expression.rhs, identifierMap)
    ;
  case 'XOR':
    return !evalExpr(expression.lhs, identifierMap) !==
      !evalExpr(expression.rhs, identifierMap)
    ;
  default:
    throw new Error(`unknown operator: ${expression.operator}`);
  }
};

export const evalVector = (identifiers, values, identifierMap) => {
  const index = identifiers.reduce((acc, id, idx) => {
    return acc + (identifierMap.get(id) ? Math.pow(2, idx) : 0);
  }, 0);

  return values.get(index);
};

export const evalUnary = (expression, identifierMap, evalExpr) => {
  switch (expression.operator) {
  case 'NOT':
    return !evalExpr(expression.operand, identifierMap);
  default:
    throw new Error(`unknown operator: ${expression.operator}`);
  }
};

export const evaluateExpression = (expression, identifierMap) => {
  if (expression === null) {
    return null;
  }
  switch (expression.node) {
  case 'binary':
    return evalBinary(expression, identifierMap,
      evaluateExpression
    );
  case 'unary':
    return evalUnary(expression, identifierMap,
      evaluateExpression
    );
  case 'group':
    return evaluateExpression(expression.content, identifierMap,
      evaluateExpression
    );
  case 'identifier':
    return !!identifierMap.get(expression);
  case 'vector':
    return evalVector(
      expression.vectorIdentifiers, expression.vectorValues,
      identifierMap
    );
  case 'constant':
    return expression.value;
  default:
    throw new Error(`unknown node: ${expression.node}`);
  }
};

const makeIdentifierMap = (identifiers, counter) =>
  I.Map(identifiers.map(
    (name, i) => [name, !!(Math.pow(2, i) & counter)]
  ))
;

const makeEvaluator = (identifierMap) => (expr) =>
  evaluateExpression(expr, identifierMap)
;

export const evaluateAll = ({
  expressions, identifiers,
  acc = I.List(), counter = Math.pow(2, identifiers.size) - 1,
}) => {
  // if (counter < 0) {
  //   return acc.reverse();
  // } else {
  let mutCounter = counter;
  let mutAcc = acc;
  while (mutCounter >= 0) {
    const identifierMap = makeIdentifierMap(identifiers, mutCounter);
    const evaluator = makeEvaluator(identifierMap);

    mutAcc = mutAcc.push(row({
      identifierValues: identifierMap,
      values: expressions.map(evaluator).toList(),
    }));

    mutCounter--;
  }

  return mutAcc.reverse();
/*
    const identifierMap = I.Map(identifiers.map(
      (name, i) => [name, !!(Math.pow(2, i) & counter)]
    ));

    const newAcc = acc.push(row({
      identifierValues: identifierMap,
      values: expressions.map((expr) =>
        evaluateExpression(expr, identifierMap)
      ).toList(),
    }));

    return evaluateAll({
      expressions,
      identifiers,
      acc: newAcc,
      counter: counter - 1,
    });
  }
    */
};

export const collectSubExpressions = (
  expression, acc = I.OrderedSet(), collect = false
) => {
  if (expression === null) {
    return acc;
  }

  const newAcc = collect === true ? acc.add(expression) : acc;

  switch (expression.node) {
  case 'binary':
    return collectSubExpressions(expression.lhs, newAcc, true)
      .concat(collectSubExpressions(expression.rhs, newAcc, true));
  case 'unary':
    return collectSubExpressions(expression.operand, newAcc, true);
  case 'group':
    return collectSubExpressions(expression.content, acc, collect);
  case 'identifier':
    return acc;
  case 'constant':
    return acc;
  case 'vector':
    return newAcc;
  default:
    throw new Error(`unknown node: ${expression.node}`);
  }
};

export const collectIdentifiers = (expression, acc = I.Set()) => {
  if (expression === null) {
    return acc;
  }
  switch (expression.node) {
  case 'binary':
    return collectIdentifiers(expression.lhs, acc).union(
      collectIdentifiers(expression.rhs, acc)
    );
  case 'unary':
    return collectIdentifiers(expression.operand, acc);
  case 'group':
    return collectIdentifiers(expression.content, acc);
  case 'identifier':
    return acc.add(expression);
  case 'constant':
    return acc;
  case 'vector':
    return acc.union(expression.vectorIdentifiers);
  default:
    throw new Error(`unknown node: ${expression.node}`);
  }
};

const defaultFormatter = {
  formatBinary: (op, lhs, rhs/*, depth*/) => {
    return `(${lhs} ${op} ${rhs})`;
  },
  formatUnary: (op, content/*, depth*/) => {
    return `(${op} ${content})`;
  },
  formatGroup: (content/*, depth*/) => {
    return content;
  },
  formatName: (name) => {
    return name;
  },
  formatValue: (value) => {
    return value;
  },
};

export const expressionToString = (
  expression, formatter = defaultFormatter, depth = 0
) => {
  if (expression === null) {
    return '';
  }

  switch (expression.node) {
  case 'binary':
    return formatter.formatBinary(
      expression.operator,
      expressionToString(expression.lhs, formatter, depth + 1),
      expressionToString(expression.rhs, formatter, depth + 1),
      depth
    );
  case 'unary':
    return formatter.formatUnary(
      expression.operator,
      expressionToString(expression.operand, formatter, depth + 1),
      depth
    );
  case 'group':
    const contentString = expressionToString(
      expression.content, formatter, depth + 1
    );
    return formatter.formatGroup(contentString, depth);
  case 'identifier':
    return formatter.formatName(expression.name);
  case 'constant':
    return formatter.formatValue(expression.value);
  case 'vector':
    return formatter.formatVector(
      expression.vectorIdentifiers, expression.vectorValues
    );
  default:
    throw new Error(`unknown node: ${expression.node}`);
  }
};
