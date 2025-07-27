import "dotenv/config";
import "hardhat-tracer";
import "solidity-docgen";
import "hardhat-abi-exporter";
import "hardhat-contract-sizer";
import "hardhat-ignore-warnings";
import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig, task } from "hardhat/config";

task("accounts", "Lists the addresses of the accounts").setAction(
	async (_, { ethers }) => {
		const accounts = await ethers.getSigners();
		const addresses = accounts.map((account) => account.address);
		console.log("Accounts:", addresses);
	},
);

task(
	"accounts-balance",
	"Lists the addresses and balance of the accounts",
).setAction(async (_, { ethers }) => {
	const accounts = await ethers.getSigners();
	const addresses = await accounts.map(async (account) => [
		account.address,
		await ethers.formatEther(
			await account.provider.getBalance(account.address),
		),
	]);
	console.log("Accounts:", await Promise.all(addresses));
});

const argv = {
	gasReport: process.env.gasReport === "true",
	coverage: process.env.coverage === "true",
};

console.dir(argv, {
	depth: null,
});

const config: HardhatUserConfig = {
	solidity: {
		version: "0.8.21",
		settings: {
			optimizer: {
				enabled: true,
				runs: 200,
			},
		},
	},
	warnings: {
		"*": {
			"code-size": !argv.coverage,
			"unused-param": !argv.coverage,
			"func-mutability": !argv.coverage,
			default: "error",
		},
	},
	gasReporter: {
		enabled: argv.gasReport,
		L1: "polygon",
		currency: "USD",
		solcInfo: {
			version: "0.8.21",
			optimizer: true,
			runs: 200,
		},
	},
	docgen: {
		outputDir: "./docs",
		pages: "files",
	},
	abiExporter: [
		{
			path: "./abi/json",
			format: "json",
			runOnCompile: true,
			clear: true,
			flat: true,
		},
		{
			path: "./abi/minimal",
			format: "minimal",
			runOnCompile: true,
			clear: true,
			flat: true,
		},
	],
	paths: {
		sources: "./contracts",
		tests: "./test",
		cache: "./cache",
		artifacts: "./artifacts",
	},
	mocha: {
		reporter: "mocha-multi-reporters",
		reporterOptions: {
			reporterEnabled: ["spec", "json"],
			jsonReporterOptions: {
				output: "test-results.json",
			},
		},
	},
};

export default config;
