import { BaseProperty, PropertyType } from 'adminjs';
import { FirestoreProperty } from '../firestore.property';
import { isReference, isString } from './type-guards';

export type FirestorePropertyType = PropertyType | 'array' | 'object';

export type SchemaItem = {
  type?: FirestorePropertyType;
  isSortable?: boolean;
  position?: number;
  schema?: Schema;
};

export type ReferenceSchemaItem = {
  referenceName?: string;
  position?: number;
};

const defaultSchemaItemOptions: SchemaItem = {
  type: 'string',
  isSortable: true,
};

export type Schema =
  | { [path: string]: SchemaItem | FirestorePropertyType | ReferenceSchemaItem }
  | string[];

const convertToProperties = (schema: Schema): BaseProperty[] => {
  if (Array.isArray(schema)) {
    return schema.map(
      path => new FirestoreProperty({ path, ...defaultSchemaItemOptions })
    );
  }

  return Object.entries(schema).map(([path, schemaItem]) => {
    if (isString(schemaItem)) {
      return new FirestoreProperty({
        path,
        ...defaultSchemaItemOptions,
        type: schemaItem,
      });
    }
    return new FirestoreProperty({
      path,
      ...defaultSchemaItemOptions,
      ...schemaItem,
    });
  });
};

const withIdProperty = (properties: BaseProperty[]): BaseProperty[] => {
  return [
    new FirestoreProperty({
      type: 'string',
      isId: true,
      path: 'id',
    }),
    ...properties,
  ];
};

export const toProperties = (schema: Schema): BaseProperty[] => {
  return withIdProperty(convertToProperties(schema));
};

export const getSchemaPaths = (schema: Schema): string[] => {
  return Array.isArray(schema) ? schema : Object.keys(schema);
};

export const getEmptyInstance = (schema: Schema): Record<string, unknown> => {
  if (Array.isArray(schema)) {
    return schema.reduce((constructedObject, currentProperty) => {
      return { ...constructedObject, [currentProperty]: null };
    }, {});
  }

  return Object.entries(schema).reduce((constructedInstance, [key, value]) => {
    if (!isString(value) && !isReference(value) && value.schema) {
      if (value === 'array' || value?.type === 'array') {
        return {
          ...constructedInstance,
          [key]: [],
        };
      }

      return {
        ...constructedInstance,
        [key]: getEmptyInstance(value.schema),
      };
    }
    return { ...constructedInstance, [key]: null };
  }, {});
};
