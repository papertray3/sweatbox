import { DBTableNames } from '@sweatbox-core/common';

const schema : string = `

create table if not exists ${DBTableNames.FILTERED_MEDIA} (
    user varchar(64),
    path text unique on conflict ignore
);

`;

export { schema };