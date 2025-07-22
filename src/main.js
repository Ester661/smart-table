import './fonts/ys-display/fonts.css'
import './style.css'

import {data as sourceData} from "./data/dataset_1.js";

import {initData} from "./data.js";
import {processFormData} from "./lib/utils.js";

import {initTable} from "./components/table.js";
// @todo: подключение
import { initPagination } from './components/pagination.js';
import { initSorting } from './components/sorting.js';
import { initFiltering } from './components/filtering.js';

function createComparison(rules) {
    return (searchValue, row) => {
      // Тут должна быть реализация createComparison, если её нет — добавьте свою
      // В вашем случае, предполагается, что есть такая функция (например, из либы)
      // Для простоты пример ниже:
      return rules.searchMultipleFields(searchValue, ['date', 'customer', 'seller'], false)(row);
    };
  }
  
  function initSearching(searchFieldName) {
    const rules = {
      searchMultipleFields: (searchValue, fields, caseInsensitive = false) => {
        if (!searchValue || searchValue.trim() === '') {
          return () => true;
        }
        const normalizedSearch = caseInsensitive ? searchValue.toLowerCase() : searchValue;
        return (row) => {
          return fields.some(field => {
            const value = row[field];
            if (value == null) return false;
            const text = caseInsensitive ? String(value).toLowerCase() : String(value);
            return text.includes(normalizedSearch);
          });
        };
      }
    };
    const compareSearch = createComparison(rules.searchMultipleFields);
    return (data, state, action) => {
      if (action && action.type === 'click' && action.name === 'reset') {
        const input = document.querySelector(`input[name="${searchFieldName}"]`);
        if (input) {
          input.value = '';
          state[searchFieldName] = '';
        }
      }
      const searchValue = state[searchFieldName] || '';
      return data.filter(row => {
        if (searchValue && !compareSearch(searchValue, row)) {
          return false;
        }
        return true;
      });
    };
  }

  const applySearching = initSearching('search');

// Исходные данные используемые в render()
const {data, ...indexes} = initData(sourceData);

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
    const state = processFormData(new FormData(sampleTable.container));
    const rowsPerPage = parseInt(state.rowsPerPage);    // приводим к числу
    const page = parseInt(state.page ?? 1);              // текущая страница по умолчанию 1

    return {
        ...state,
        rowsPerPage,
        page
    };
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
function render(action) {
    let state = collectState(); // состояние полей из таблицы
    state.search = document.querySelector('input[name="search"]').value;
    let result = [...data]; // копируем для последующего изменения
    result = applySearching(result, state, action);
    // @todo: использование
    result = applyFiltering(result, state);

    result = applySorting(result, state, action);

    result = applyPagination(result, state, action);

    sampleTable.render(result)
}

const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],
    after: ['pagination']
}, render);

// @todo: инициализация
const applyPagination = initPagination(
    sampleTable.pagination.elements,             // передаём сюда элементы пагинации, найденные в шаблоне
    (el, page, isCurrent) => {                    // и колбэк, чтобы заполнять кнопки страниц данными
        const input = el.querySelector('input');
        const label = el.querySelector('span');
        input.value = page;
        input.checked = isCurrent;
        label.textContent = page;
        return el;
    }
);

const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

// Обработчики для поиска
const searchInput = document.querySelector('input[name="search"]');
const resetBtn = document.querySelector('button[data-name="reset"]');

searchInput.addEventListener('input', () => {
  render();
});
resetBtn.addEventListener('click', () => {
  searchInput.value = '';
  render();
});

// Вызов initSorting и дальнейшие действия
const applySorting = initSorting([        // Нам нужно передать сюда массив элементов, которые вызывают сортировку, чтобы изменять их визуальное представление
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal
]);

const applyFiltering = initFiltering(sampleTable.filter.elements, {    // передаём элементы фильтра
    searchBySeller: indexes.sellers                                    // для элемента с именем searchBySeller устанавливаем массив продавцов
});

render();