import {rules, createComparison} from "../lib/compare.js";


export function initSearching(searchField) {
    // @todo: #5.1 — настроить компаратор
    const searchComparator = createComparison((targetValue, filterValue) => {
        if (filterValue === undefined || filterValue === null || filterValue === '') {
            return true; 
        }
        if (targetValue === undefined || targetValue === null) {
            return false; 
        }
        return targetValue.toString().toLowerCase().includes(filterValue.toString().toLowerCase());
    });

    
    const searchRule = rules.searchMultipleFields(searchField, ['date', 'customer', 'seller'], false);

    return (data, state, action) => {
        // @todo: #5.2 — применить компаратор
        const searchValue = state?.filters?.[searchField];

        if (!searchValue || searchValue.trim() === '') {
        return data;
    }

    return searchRule(data, searchValue, {
        skipEmptyTargetValues: true,
        comparator: comparator
    });

    }
}