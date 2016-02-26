import I from 'immutable';

const labelExpression = I.Record({
  location: null,
  name: null,
  body: null,
}, 'label');

const binaryExpression = I.Record({
  operator: null,
  lhs: null,
  rhs: null,
}, 'binary');

const unaryExpression = I.Record({
  operator: null,
  operand: null,
}, 'unary');

const groupExpression = I.Record({
  body: null,
  style: null,
}, 'group');

const identifierExpression = I.Record({
  name: null,
}, 'identifier');

const constantExpression = I.Record({
  value: null,
}, 'constant');

const vectorExpression = I.Record({
  identifiers: I.List(),
  values: I.List(),
}, 'vector');

export const expressionFromJson = (data) => {
  if (data === null) {
    return null;
  }

  switch (data.node) {
  case 'label':
    return labelExpression({
      location: data.location,
      name: data.name,
      body: expressionFromJson(data.body),
    });
  case 'binary':
    return binaryExpression({
      operator: data.operator.toString(),
      lhs: expressionFromJson(data.lhs),
      rhs: expressionFromJson(data.rhs),
    });
  case 'unary':
    return unaryExpression({
      operator: data.operator.toString(),
      operand: expressionFromJson(data.operand),
    });
  case 'group':
    return groupExpression({
      body: expressionFromJson(data.body),
      style: data.style,
    });
  case 'identifier':
    return identifierExpression({
      name: data.name.toString(),
    });
  case 'constant':
    return constantExpression({
      value: data.value,
    });
  case 'vector':
    return vectorExpression({
      identifiers: data.vector.identifiers.map(expressionFromJson),
      values: I.List(data.vector.values),
    });
  default:
    throw new Error(`unknown node: ${data}`);
  }
};
