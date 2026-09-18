const mode = process.argv[2] ?? 'ok';
if (mode === 'ok') console.log(JSON.stringify({ outcome: 'ok', value: 7 }, null, 2));
else if (mode === 'crash') throw new Error('synthetic qualifier crash');
else if (mode === 'hang') setInterval(() => {}, 1000);
else process.exitCode = 9;
