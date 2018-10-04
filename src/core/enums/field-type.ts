export enum FieldType {
    STRING = 1 << 0,
    NUMBER = 1 << 1,
    BOOLEAN = 1 << 2,
    DATE = 1 << 3,
    OBJECT = 1 << 4,
    FUNCTION = 1 << 5,
    ARRAY = 1 << 6,
    NULL = 1 << 7,
    // GUID
}
