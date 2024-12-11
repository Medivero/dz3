const OPERATIONS = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => a / b,
};

const FUNCTIONS = {
  abs: (x) => Math.abs(x),
  sort: (arr) => [...arr].sort((a, b) => a - b),
};

/**
 * Основная функция парсинга.
 * @param {string} input Входной текст.
 * @returns {string} Результат в формате TOML.
 */
function parseConfig(input) {
  const lines = input.split('\n');
  const variables = {};
  const output = {};

  lines.forEach((line, index) => {
    line = line.trim();

    // Пропуск пустых строк и комментариев
    if (!line || line.startsWith('/*') || line.startsWith('*/') || line.startsWith('*')) {
      return;
    }

    // Объявление переменных
    if (line.startsWith('var')) {
      const match = line.match(/^var\s+([a-zA-Z][_a-zA-Z0-9]*)\s*=\s*(.+)$/);
      if (!match) throw new Error(`Ошибка синтаксиса в строке ${index + 1}: "${line}"`);

      const [, name, value] = match;
      variables[name] = parseValue(value, variables);
      return;
    }

    // Константные выражения
    if (line.startsWith('{') && line.endsWith('}')) {
      const expression = line.slice(1, -1).trim();
      const result = evaluateExpression(expression, variables);
      output[`expression_${index + 1}`] = result;
      return;
    }

    throw new Error(`Неизвестная конструкция в строке ${index + 1}: "${line}"`);
  });

  return toToml({ variables, expressions: output });
}

/**
 * Разбирает значение переменной.
 * @param {string} value Значение.
 * @param {Object} variables Переменные.
 * @returns {*} Разобранное значение.
 */
function parseValue(value, variables) {
  value = value.trim();

  // Число
  if (!isNaN(Number(value))) return Number(value);

  // Массив
  if (value.startsWith('(') && value.endsWith(')')) {
    return value
      .slice(1, -1)
      .split(',')
      .map((v) => parseValue(v.trim(), variables));
  }

  // Ссылка на переменную
  if (variables[value] !== undefined) return variables[value];

  throw new Error(`Неизвестное значение: "${value}"`);
}

/**
 * Вычисляет выражение в постфиксной записи.
 * @param {string} expression Постфиксное выражение.
 * @param {Object} variables Переменные.
 * @returns {*} Результат вычисления.
 */
function evaluateExpression(expression, variables) {
  const stack = [];
  const tokens = expression.split(/\s+/);

  tokens.forEach((token) => {
    if (!isNaN(Number(token))) {
      stack.push(Number(token));
    } else if (variables[token] !== undefined) {
      stack.push(variables[token]);
    } else if (OPERATIONS[token]) {
      const b = stack.pop();
      const a = stack.pop();
      stack.push(OPERATIONS[token](a, b));
    } else if (FUNCTIONS[token]) {
      const arg = stack.pop();
      stack.push(FUNCTIONS[token](arg));
    } else {
      throw new Error(`Неизвестный токен: "${token}"`);
    }
  });

  if (stack.length !== 1) throw new Error(`Неправильное выражение: "${expression}"`);
  return stack[0];
}

/**
 * Преобразует объект в TOML.
 * @param {Object} data Данные.
 * @returns {string} Строка в формате TOML.
 */
function toToml(data) {
  const convert = (obj, prefix = '') =>
    Object.entries(obj)
      .map(([key, value]) => {
        if (typeof value === 'object' && !Array.isArray(value)) {
          return convert(value, `${prefix}${key}.`);
        } else if (Array.isArray(value)) {
          return `${prefix}${key} = [${value.join(', ')}]`;
        } else {
          return `${prefix}${key} = ${value}`;
        }
      })
      .join('\n');

  return convert(data);
}

module.exports = { parseConfig };
