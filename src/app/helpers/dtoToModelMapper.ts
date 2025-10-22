import { DataSource } from 'typeorm';
export default function (dataSource: DataSource, entity: any, dto: any) {
  const model = new entity();

  const fields = dataSource
    .getRepository(entity)
    .metadata.ownColumns.map((column) => column.propertyName);
  const keys = Object.keys(dto);

  for (const key of keys) {
    if (fields.indexOf(key) != -1) {
      model[key] = dto[key];
    }
  }

  return model;
}
