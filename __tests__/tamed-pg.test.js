const tp = require('../tamed-pg.js');

test('Verify tamed-pg.js', async () => {
	const l_credentials = {
		"user": "tamedpgusr",
		"password": "easypassword",
		"database": "tamedpgdb",
		"port": 5432,
		"host": "localhost"
	};

	let poolname = await tp.connect(l_credentials);
	const l_result = await tp.runSQL(poolname, 'select 1 + 1 as solution', [], true);
	expect(l_result.rows[0].solution).toBe(2);
	const l_create_table = await tp.runSQL(poolname, 'create table if not exists tamedpg.test_table (id serial primary key, text varchar(40) not null, complete boolean)', [], true);
	expect(l_create_table.command).toBe('CREATE');
	const l_insert = await tp.runSQL(poolname, 'insert into tamedpg.test_table(text, complete) values($1, $2) returning *', ['hello world', false], true);
	expect(l_insert.rows[0].text).toBe('hello world');
	expect(l_insert.rows[0].complete).toBe(false);
	const l_select = await tp.runSQL(poolname, 'select * from tamedpg.test_table where id = $1', [l_insert.rows[0].id], true);
	expect(l_select.rows[0].text).toBe('hello world');
	expect(l_select.rows[0].complete).toBe(false);
	const l_update = await tp.runSQL(poolname, 'update TamedPG.test_table SET text = $1, complete = $2 WHERE id = $3', ['hello world 2', true, l_insert.rows[0].id], true);
	expect(l_update.command).toBe('UPDATE');
	const l_select2 = await tp.runSQL(poolname, 'select * from tamedpg.test_table where id = $1', [l_insert.rows[0].id], true);
	expect(l_select2.rows[0].text).toBe('hello world 2');
	expect(l_select2.rows[0].complete).toBe(true);
	const l_delete = await tp.runSQL(poolname, 'delete from tamedpg.test_table where id = $1', [l_insert.rows[0].id], true);
	expect(l_delete.command).toBe('DELETE');
	const l_select3 = await tp.runSQL(poolname, 'select * from tamedpg.test_table where id = $1', [l_insert.rows[0].id], true);
	expect(l_select3.rows.length).toBe(0);
	const l_drop_table = await tp.runSQL(poolname, 'drop table TamedPG.test_table', [], true);
	expect(l_drop_table.command).toBe('DROP');
	let releaseResult  = await tp.end(poolname);
	expect(releaseResult).toBe(true);
});