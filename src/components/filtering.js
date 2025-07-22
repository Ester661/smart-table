import {createComparison, defaultRules} from "../lib/compare.js";

// @todo: #4.3 — настроить компаратор
const compare = createComparison(defaultRules);

export function initFiltering(elements, indexes) {
    // @todo: #4.1 — заполнить выпадающие списки опциями
    Object.keys(indexes)                                    // Получаем ключи из объекта
      .forEach((elementName) => {                        // Перебираем по именам
        elements[elementName].append(                    // в каждый элемент добавляем опции
            ...Object.values(indexes[elementName])        // формируем массив имён, значений опций
                      .map(name => {                        // используйте name как значение и текстовое содержимое
                        const option = document.createElement('option');
                        option.value = name;
                        option.textContent = name;
                        return option;                                // @todo: создать и вернуть тег опции
                      })
        )
     })
    return (data, state, action) => {
    // @todo: #4.2 — обработать очистку поля
    if (action && action.type === 'click' && action.name === 'clear') {
        // Найти кнопку "clear"
        const button = action.element; // предполагается, что action.element — это кнопка
        if (button) {
            // Получить родительский элемент кнопки
            const parent = button.parentElement;
            if (parent) {
                // Найти input внутри родителя
                const input = parent.querySelector('input[data-field]');
                if (input) {
                    input.value = ''; // очистить значение input
                    // Обновить состояние, если есть
                    const fieldName = input.getAttribute('data-field');
                    if (fieldName) {
                        state[fieldName] = '';
                    }
                }
            }
        }
    }
    // @todo: #4.5 — отфильтровать данные используя компаратор
    const filteredData = data.filter(row => compare(row, state)); 
        return filteredData;
    }
}