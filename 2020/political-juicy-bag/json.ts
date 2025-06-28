/*
TODO:
 - Tests
 - npm module
*/

type Class = Function;
type FieldName = string;
enum ShouldJson { Yes, No, Optional };
class FieldInfo {
  type: any = null;
  subType: any = null;
  shouldJson: ShouldJson = ShouldJson.No;
  constructor() {}
}

const typeFieldInfos = new Map<Class, Map<FieldName, FieldInfo>>();

function getFieldInfo(type: any, fieldName: string): FieldInfo {
  let fieldInfos = typeFieldInfos.get(type);
  if (!fieldInfos) {
    fieldInfos = new Map<string, FieldInfo>();
    typeFieldInfos.set(type, fieldInfos);
  }
  let info = fieldInfos.get(fieldName);
  if (!info) {
    info = new FieldInfo()
    fieldInfos.set(fieldName, info);
  }
  return info;
}

Object.defineProperty(Reflect, 'metadata', {
  value: (key: string, value: any) => (target: Object, fieldName: string) => {
    if (key != 'design:type')
      return;
    getFieldInfo(target.constructor, fieldName).type = value;
  },
});

interface Type<T> {
  new(...args: any[]): T;
}

function isContainerType(type: any) {
  return type == Array || type == Map || type == Set;
}

export function json<T>(containerSubType: Type<T> = null, optional: boolean = false) {
  return function(target: Object, fieldName: string) {
    const type = target.constructor;
    const fieldInfo = getFieldInfo(type, fieldName);
    fieldInfo.shouldJson = optional ? ShouldJson.Optional : ShouldJson.Yes;

    const fieldType = fieldInfo.type;
    const isContainer = isContainerType(fieldType);
    if (containerSubType) {
      if (!isContainer)
        throw `@json(${containerSubType.name}) may only be set on a container field. ${type.name}.${fieldName} is a ${fieldType.name}.`;
      fieldInfo.subType = containerSubType;
    } else if (isContainer) {
      throw `${type.name}.${fieldName} is a ${fieldType.name}. @json(SubType) must be specified.`;
    }
  }
}

export function maybeJson<T>(containerSubType: Type<T> = null) {
  return json(containerSubType, true);
}

type Result<T> = { ok: true, value: T } | { ok: false, errors: string[] };
export function fromJson<T, S>(type: Type<T>, json: any): Result<T> {
  const errors: string[] = [];
  const value = fromJsonImpl(type, null, json, (error: string) => errors.push(error));
  if (errors.length > 0)
    return { ok: false, errors };
  return { ok: true, value };
}

function fromJsonImpl<T, S>(
  typeParam: Type<T>,
  subType: Type<S>,
  json: any,
  onErrorParam: (error: string) => void
): T {
  const type: any = typeParam;
  const onError = (error: string) => {
    onErrorParam(error);
    return new type();
  };
  switch (type) {
    case Boolean:
    case Number:
    case String: {
      if (typeof json != type.name.toLowerCase())
        return onError(`: Expected ${type.name} got ${typeof json}.`);
      return type(json) as any;
    }
    
    case Array:
    case Set: {
      if (!(json instanceof Array))
        return onError(`: Expected Array got ${typeof json}.`);
      const innerResults = json.map((item: any) => fromJsonImpl(subType, null, item, onError));
      return type == Set ? new type(innerResults) : innerResults;
    }
    
    case Map: {
      if (!(json instanceof Object))
        return onError(`: Expected Object got ${typeof json}.`);
      const result = new Map<string, S>();
      for (const [key, value] of Object.entries(json)) {
        result.set(
          key,
          fromJsonImpl(subType, null, value, (error: string) => {
            onError(`['${key}']${error}`);
          })
        );
      }
      return result as any;
    }
    
    default: {
      if (!(json instanceof Object))
        return onError(`: Expected Object got ${typeof json}.`);

      const result: any = new type();
      let foundJson = false;
      const fieldInfos = typeFieldInfos.get(type);
      if (fieldInfos) {
        for (const [fieldName, fieldInfo] of fieldInfos) {
          if (fieldInfo.shouldJson == ShouldJson.No)
            continue;
          foundJson = true;
          if (fieldInfo.shouldJson == ShouldJson.Optional && !(fieldName in json)) {
            result[fieldName] = null;
            continue;
          }
          result[fieldName] = fromJsonImpl(
            fieldInfo.type,
            fieldInfo.subType,
            json[fieldName],
            (error: string) => {
              onError(`<${type.name}>.${fieldName}${error}`);
            }
          );
        }
      }
      
      if (!foundJson)
        throw `${type.name} must have an @json decorated field.`;

      return result;
    }
  }
}

export function toJson(value: any): any {
  switch (typeof value) {
    case 'boolean':
    case 'string':
    case 'number':
      return value;

    case 'object': {
      if (value === null)
        return value;

      const type = value.constructor;
      switch (type) {
        case Object:
          return value;

        case Array:
        case Set: {
          const result = [];
          for (const item of value)
            result.push(toJson(item));
          return result;
        }
        
        case Map: {
          const result: any = {};
          for (const [key, subValue] of value)
            result[key] = toJson(subValue);
          return result;
        }
        
        default: {
          const result: any = {};
          const fieldInfos = typeFieldInfos.get(type);
          let foundJson = false;
          if (fieldInfos) {
            for (const [fieldName, fieldInfo] of fieldInfos) {
              if (fieldInfo.shouldJson == ShouldJson.No)
                continue;
              foundJson = true;
              result[fieldName] = toJson(value[fieldName]);
            }
          }
          if (!foundJson)
            throw `${type.name} must have an @json decorated field.`;
          return result;
        }
      }
    }

    default:
      throw `Cannot convert ${typeof value} to JSON.`;
  }
}
