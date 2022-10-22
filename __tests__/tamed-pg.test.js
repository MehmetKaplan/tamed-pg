const tp = require('../tamed-pg.js');

test('Verify tamed-pg.js', async () => {
	const l_credentials = {
		"user": "tamedpgusr",
		"password": "easypassword",
		"database": "TamedPGDB",
		"port": 5432,
		"host": "localhost"
	};

	await tp.connect(l_credentials);
	const l_result = await tp.runSQL('SELECT 1 + 1 AS solution', []);
	expect(l_result.rows[0].solution).toBe(2);
	const l_create_table = await tp.runSQL('CREATE TABLE IF NOT EXISTS TamedPG.test_table (id SERIAL PRIMARY KEY, text VARCHAR(40) not null, complete BOOLEAN)', []);
	expect(l_create_table.command).toBe('CREATE');
	const l_insert = await tp.runSQL('INSERT INTO TamedPG.test_table(text, complete) values($1, $2) RETURNING *', ['hello world', false]);
	expect(l_insert.rows[0].text).toBe('hello world');
	expect(l_insert.rows[0].complete).toBe(false);
	const l_select = await tp.runSQL('SELECT * FROM TamedPG.test_table WHERE id = $1', [l_insert.rows[0].id]);
	expect(l_select.rows[0].text).toBe('hello world');
	expect(l_select.rows[0].complete).toBe(false);
	const l_update = await tp.runSQL('UPDATE TamedPG.test_table SET text = $1, complete = $2 WHERE id = $3', ['hello world 2', true, l_insert.rows[0].id]);
	expect(l_update.command).toBe('UPDATE');
	const l_select2 = await tp.runSQL('SELECT * FROM TamedPG.test_table WHERE id = $1', [l_insert.rows[0].id]);
	expect(l_select2.rows[0].text).toBe('hello world 2');
	expect(l_select2.rows[0].complete).toBe(true);
	const l_delete = await tp.runSQL('DELETE FROM TamedPG.test_table WHERE id = $1', [l_insert.rows[0].id]);
	expect(l_delete.command).toBe('DELETE');
	const l_select3 = await tp.runSQL('SELECT * FROM TamedPG.test_table WHERE id = $1', [l_insert.rows[0].id]);
	expect(l_select3.rows.length).toBe(0);
	const l_drop_table = await tp.runSQL('DROP TABLE TamedPG.test_table', []);
	expect(l_drop_table.command).toBe('DROP');
});