import traverse from 'json-schema-traverse';

// note: it's similar as `jest.spyOn`, but as workaround for default exports
export default jest.fn(traverse);
