Simplified, 2 function, node pooling for PostgreSQL. Under the hood uses the `pg`.

### Installation

```
yarn add tamed-pg
```

### Usage

```javascript
const tp = require('tamed-pg');

// Check Test section for DB configuration for the testing

	const l_credentials = {
		"user": "tamedpgusr",
		"password": "easypassword",
		"database": "tamedpgdb",
		"port": 5432,
		"host": "localhost"
	};

const test = async () => {
	let poolname = await tp.connect(l_credentials);
	const l_result = await tp.runSQL(poolname, 'select 1 + 1 as solution', [], true);
	const l_create_table = await tp.runSQL(poolname, 'create table if not exists tamedpg.test_table (id serial primary key, text varchar(40) not null, complete boolean)', [], true);
	const l_insert = await tp.runSQL(poolname, 'insert into tamedpg.test_table(text, complete) values($1, $2) returning *', ['hello world', false], true);
	const l_select = await tp.runSQL(poolname, 'select * from tamedpg.test_table where id = $1', [l_insert.rows[0].id], true);
	const l_update = await tp.runSQL(poolname, 'update TamedPG.test_table SET text = $1, complete = $2 WHERE id = $3', ['hello world 2', true, l_insert.rows[0].id], true);
	const l_select2 = await tp.runSQL(poolname, 'select * from tamedpg.test_table where id = $1', [l_insert.rows[0].id], true);
	const l_delete = await tp.runSQL(poolname, 'delete from tamedpg.test_table where id = $1', [l_insert.rows[0].id], true);
	const l_select3 = await tp.runSQL(poolname, 'select * from tamedpg.test_table where id = $1', [l_insert.rows[0].id], true);
	const l_drop_table = await tp.runSQL(poolname, 'drop table TamedPG.test_table', [], true);
	let releaseResult  = await tp.end(poolname);
}

test();
```

### Test

The jest tests assume a DB is prepared already with following commands.

1. Generate a DB for the test.

```bash
sudo -u postgres createdb tamedpgdb
```

2. Generate the user with **small letters**:

```bash
sudo -u postgres psql << EOF
	create user tamedpgusr encrypted password 'easypassword';
	grant all on database "tamedpgdb" to tamedpgusr;
	\c tamedpgdb;
	create schema tamedpg authorization tamedpgusr;
EOF
```

3. Add following line to `/etc/postgresql/[VERSION]/main/pg_hba.conf` in the local area **before the peer row in order to take precedence**.

```
local   all             tamedpgusr                              scram-sha-256
```

4. Restart the service.

```bash
sudo service postgresql restart
```

5. Test

```bash
yarn test
```

6. After tests are finished clean the database

```bash
sudo -u postgres psql << EOF
	\c tamedpgdb;
	drop schema tamedpg;
	revoke all on database "tamedpgdb" from tamedpgusr;
	drop user tamedpgusr;
EOF
```

### License

The license is MIT and full text [here](LICENSE).

#### Used Modules

* tick-log license [here](./OtherLicenses/tick-log.txt)
* pg license [here](./OtherLicenses/pg.txt)
