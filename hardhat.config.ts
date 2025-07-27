import "dotenv/config";
import "hardhat-tracer";
import "solidity-docgen";
import yargs from "yargs";
import "hardhat-abi-exporter";
import "hardhat-contract-sizer";
import "hardhat-ignore-warnings";
import { hideBin } from "yargs/helpers";
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

const argv = yargs(hideBin(process.argv))
	.option("coverage", {
		type: "boolean",
		default: false,
		description: "Enable coverage mode",
	})
	.option("gasReport", {
		type: "boolean",
		default: false,
		description: "Enable gas reporting",
	})
	.help()
	.alias("help", "h")
	.parseSync();

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
		currency: "USD",
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
