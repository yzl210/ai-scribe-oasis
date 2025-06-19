import { z, ZodObject, ZodTypeAny } from 'zod';

export function zodEnumFromObject<K extends string>(obj: Record<K, any>): z.ZodEnum<[K, ...K[]]> {
    const [firstKey, ...otherKeys] = Object.keys(obj) as K[];
    return z.enum([firstKey, ...otherKeys]);
}

export function keysToSchema(keys: string[], schema: z.ZodTypeAny) {
    return Object.fromEntries(keys.map((k) => [k, schema]));
}

export function createNull<T extends ZodTypeAny>(schema: T): z.infer<T> {
    if (schema instanceof ZodObject) {
        const shape = (schema as ZodObject<any>).shape;
        return Object.fromEntries(
            Object.entries(shape).map(([k, v]) => [k, createNull(v as ZodTypeAny)]),
        ) as z.infer<T>;
    }

    if (schema.isNullable()) {
        return null as z.infer<T>;
    }

    return null as z.infer<T>;
}