#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
const { parseConfig } = require('./parser');

// Настройка аргументов командной строки
const args = yargs
  .option('input', {
    alias: 'i',
    type: 'string',
    demandOption: true,
    describe: 'Путь к файлу с входными данными',
  })
  .help()
  .argv;

// Проверяем существование входного файла
if (!fs.existsSync(args.input)) {
  console.error(`Файл "${args.input}" не найден.`);
  process.exit(1);
}

// Читаем входной файл
try {
  const input = fs.readFileSync(args.input, 'utf-8');
  const output = parseConfig(input);
  console.log(output);
} catch (error) {
  console.error(`Ошибка обработки файла: ${error.message}`);
  process.exit(1);
}
