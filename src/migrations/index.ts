import * as migration_20261013_121122_initial from './20261013_121122_initial';
import * as migration_20261013_140503_schema_updates from './20261013_140503_schema_updates';

export const migrations = [
  {
    up: migration_20261013_121122_initial.up,
    down: migration_20261013_121122_initial.down,
    name: '20261013_121122_initial',
  },
  {
    up: migration_20261013_140503_schema_updates.up,
    down: migration_20261013_140503_schema_updates.down,
    name: '20261013_140503_schema_updates'
  },
];
