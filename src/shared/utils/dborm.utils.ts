import { DataSource, QueryRunner } from 'typeorm';

export const startTransaction = async (dataSource: DataSource): Promise<QueryRunner> => {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  return queryRunner;
};

export const commitTransaction = async (
  queryRunner: QueryRunner,
  _timeout?: number,
): Promise<void> => {
  const timeout = _timeout ? _timeout : 1000 * 60;

  const timeoutPromise = new Promise<void>((_, reject) => {
    setTimeout(() => {
      reject(new Error('Transaction timeout'));
    }, timeout);
  });
  try {
    await Promise.race([
      (async () => {
        await queryRunner.commitTransaction();
      })(),
      timeoutPromise,
    ]);
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
};

export const rollbackTransaction = async (queryRunner: QueryRunner): Promise<void> => {
  try {
    await queryRunner.rollbackTransaction();
  } finally {
    await queryRunner.release();
  }
};

export const lockEntireTable = async (
  queryRunner,
  tableName: string,
  lockMode:
    | 'ACCESS SHARE'
    | 'ROW SHARE'
    | 'ROW EXCLUSIVE'
    | 'SHARE UPDATE EXCLUSIVE'
    | 'SHARE'
    | 'SHARE ROW EXCLUSIVE'
    | 'EXCLUSIVE'
    | 'ACCESS SHARE'
    | 'ACCESS EXCLUSIVE',
) => {
  await queryRunner.query(`LOCK TABLE "${tableName}" IN ${lockMode} MODE`);
  return queryRunner;
};
