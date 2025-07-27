module.exports = {
	norpc: true,
	testCommand: "bun test",
	compileCommand: "bun compile",
	skipFiles: [],
	providerOptions: {
		default_balance_ether: "100000000000000000000000",
	},
	mocha: {
		fgrep: "[skip-on-coverage]",
		invert: true,
	},
};
