const MATERIAL_LIST_PATH = '/materials';

export const materialListPath = (query = '') => `${MATERIAL_LIST_PATH}${query}`;

export const materialCreatePath = (query = '') => `${MATERIAL_LIST_PATH}/new${query}`;

export const materialDetailPath = (id: string, query = '') => `${MATERIAL_LIST_PATH}/${id}${query}`;

export const materialEditPath = (id: string, query = '') => `${MATERIAL_LIST_PATH}/${id}/edit${query}`;

export const materialListPathAfterDelete = (query: string) => {
    const params = new URLSearchParams(query);
    params.delete('page');

    const next = params.toString();

    return materialListPath(next === '' ? '' : `?${next}`);
};
