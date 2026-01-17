import { AutoDocsGenerator } from './autoDocsGenerator.js';

/**
 * Route Documentation Helpers
 * Makes it easy to add auto-generated documentation to routes
 */

/**
 * Document a GET route
 */
export const getDoc = (path, config) => {
  return AutoDocsGenerator.doc({
    method: 'GET',
    path,
    ...config,
  });
};

/**
 * Document a POST route
 */
export const postDoc = (path, config) => {
  return AutoDocsGenerator.doc({
    method: 'POST',
    path,
    ...config,
  });
};

/**
 * Document a PUT route
 */
export const putDoc = (path, config) => {
  return AutoDocsGenerator.doc({
    method: 'PUT',
    path,
    ...config,
  });
};

/**
 * Document a PATCH route
 */
export const patchDoc = (path, config) => {
  return AutoDocsGenerator.doc({
    method: 'PATCH',
    path,
    ...config,
  });
};

/**
 * Document a DELETE route
 */
export const deleteDoc = (path, config) => {
  return AutoDocsGenerator.doc({
    method: 'DELETE',
    path,
    ...config,
  });
};

/**
 * Generate OpenAPI documentation from documented routes
 */
export const generateDocs = (routes) => {
  return AutoDocsGenerator.generatePaths(routes);
};

export default {
  getDoc,
  postDoc,
  putDoc,
  patchDoc,
  deleteDoc,
  generateDocs,
};
