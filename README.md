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
	"database": "TamedPGDB",
	"port": 5432,
	"host": "localhost"
};

const test = async () => {
	await tp.connect(l_credentials);
	const l_result = await tp.runSQL('SELECT 1 + 1 AS solution', []);
	const l_create_table = await tp.runSQL('CREATE TABLE IF NOT EXISTS TamedPG.test_table (id SERIAL PRIMARY KEY, text VARCHAR(40) not null, complete BOOLEAN)', []);
	const l_insert = await tp.runSQL('INSERT INTO TamedPG.test_table(text, complete) values($1, $2) RETURNING *', ['hello world', false]);
	const l_select = await tp.runSQL('SELECT * FROM TamedPG.test_table WHERE id = $1', [l_insert.rows[0].id]);
	const l_update = await tp.runSQL('UPDATE TamedPG.test_table SET text = $1, complete = $2 WHERE id = $3', ['hello world 2', true, l_insert.rows[0].id]);
	const l_select2 = await tp.runSQL('SELECT * FROM TamedPG.test_table WHERE id = $1', [l_insert.rows[0].id]);
	const l_delete = await tp.runSQL('DELETE FROM TamedPG.test_table WHERE id = $1', [l_insert.rows[0].id]);
	const l_select3 = await tp.runSQL('SELECT * FROM TamedPG.test_table WHERE id = $1', [l_insert.rows[0].id]);
	const l_drop_table = await tp.runSQL('DROP TABLE TamedPG.test_table', []);
}

test();
```

### Test

The jest tests assume a DB is prepared already with following commands.

1. Generate a DB for the test.

```bash
sudo -u postgres createdb TamedPGDB
```

2. Generate the user with **small letters**:

```bash
sudo -u postgres psql << EOF
	create user tamedpgusr encrypted password 'easypassword';
	grant all on database "TamedPGDB" to tamedpgusr;
	\c TamedPGDB;
	create schema TamedPG authorization tamedpgusr;
EOF
```

3. Add following line to `/etc/postgresql/[VERSION]/main/pg_hba.conf` in the local area **before the peer row in order to take precedence**.

```
local   all             tamedpgusr                              password
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
	\c TamedPGDB;
	drop schema TamedPG;
	revoke all on database "TamedPGDB" from tamedpgusr;
	drop user tamedpgusr;
EOF
```

### License

The license is MIT and full text [here](LICENSE).

#### Used Modules

* tick-log license [here](./OtherLicenses/tick-log.txt)
* pg license [here](./OtherLicenses/pg.txt)
