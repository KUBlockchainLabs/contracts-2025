import hre from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("Merchant", function () {
	async function deployMerchantFixture() {
		const [owner, otherAccount] = await hre.ethers.getSigners();

		const Merchant = await hre.ethers.getContractFactory("Merchant");
		const merchant = await Merchant.deploy();

		return { merchant, owner, otherAccount };
	}

	describe("Deployment", function () {
		it("Should deploy successfully", async function () {
			const { merchant } = await loadFixture(deployMerchantFixture);
			expect(merchant.target).to.be.properAddress;
		});
	});

	describe("Item Management", function () {
		describe("Adding Items", function () {
			it("Should add an item with addItem function", async function () {
				const { merchant } = await loadFixture(deployMerchantFixture);

				await merchant.addItem("Apple", 100, 50);

				const [name, price, quantity] = await merchant.getItem(0);
				expect(name).to.equal("Apple");
				expect(price).to.equal(100);
				expect(quantity).to.equal(50);
			});

			it("Should add an item with addStructItem function", async function () {
				const { merchant } = await loadFixture(deployMerchantFixture);

				const item = {
					name: "Orange",
					price: 150,
					quantity: 30,
				};

				await merchant.addStructItem(item);

				const [name, price, quantity] = await merchant.getItem(0);
				expect(name).to.equal("Orange");
				expect(price).to.equal(150);
				expect(quantity).to.equal(30);
			});

			it("Should add multiple items", async function () {
				const { merchant } = await loadFixture(deployMerchantFixture);

				await merchant.addItem("Apple", 100, 50);
				await merchant.addItem("Banana", 75, 25);
				await merchant.addStructItem({
					name: "Cherry",
					price: 200,
					quantity: 10,
				});

				const [name1, price1, quantity1] = await merchant.getItem(0);
				const [name2, price2, quantity2] = await merchant.getItem(1);
				const [name3, price3, quantity3] = await merchant.getItem(2);

				expect(name1).to.equal("Apple");
				expect(price1).to.equal(100);
				expect(quantity1).to.equal(50);

				expect(name2).to.equal("Banana");
				expect(price2).to.equal(75);
				expect(quantity2).to.equal(25);

				expect(name3).to.equal("Cherry");
				expect(price3).to.equal(200);
				expect(quantity3).to.equal(10);
			});

			it("Should handle empty item name", async function () {
				const { merchant } = await loadFixture(deployMerchantFixture);

				await merchant.addItem("", 100, 50);

				const [name, price, quantity] = await merchant.getItem(0);
				expect(name).to.equal("");
				expect(price).to.equal(100);
				expect(quantity).to.equal(50);
			});

			it("Should handle zero price and quantity", async function () {
				const { merchant } = await loadFixture(deployMerchantFixture);

				await merchant.addItem("Free Item", 0, 0);

				const [name, price, quantity] = await merchant.getItem(0);
				expect(name).to.equal("Free Item");
				expect(price).to.equal(0);
				expect(quantity).to.equal(0);
			});

			it("Should handle maximum uint40 quantity", async function () {
				const { merchant } = await loadFixture(deployMerchantFixture);

				const maxUint40 = 2n ** 40n - 1n;
				await merchant.addItem("Max Quantity Item", 100, maxUint40);

				const [name, price, quantity] = await merchant.getItem(0);
				expect(name).to.equal("Max Quantity Item");
				expect(price).to.equal(100);
				expect(quantity).to.equal(maxUint40);
			});

			it("Should handle maximum uint256 price", async function () {
				const { merchant } = await loadFixture(deployMerchantFixture);

				const maxUint256 = 2n ** 256n - 1n;
				await merchant.addItem("Max Price Item", maxUint256, 1);

				const [name, price, quantity] = await merchant.getItem(0);
				expect(name).to.equal("Max Price Item");
				expect(price).to.equal(maxUint256);
				expect(quantity).to.equal(1);
			});
		});

		describe("Retrieving Items", function () {
			it("Should retrieve item using getItem", async function () {
				const { merchant } = await loadFixture(deployMerchantFixture);

				await merchant.addItem("Test Item", 123, 456);

				const [name, price, quantity] = await merchant.getItem(0);
				expect(name).to.equal("Test Item");
				expect(price).to.equal(123);
				expect(quantity).to.equal(456);
			});

			it("Should retrieve item using getItemNotLocalVariable", async function () {
				const { merchant } = await loadFixture(deployMerchantFixture);

				await merchant.addItem("Test Item 2", 789, 101);

				const [name, price, quantity] =
					await merchant.getItemNotLocalVariable(0);
				expect(name).to.equal("Test Item 2");
				expect(price).to.equal(789);
				expect(quantity).to.equal(101);
			});

			it("Should retrieve item using getStructItem", async function () {
				const { merchant } = await loadFixture(deployMerchantFixture);

				await merchant.addItem("Struct Item", 999, 888);

				const item = await merchant.getStructItem(0);
				expect(item.name).to.equal("Struct Item");
				expect(item.price).to.equal(999);
				expect(item.quantity).to.equal(888);
			});

			it("Should return same data for all getter functions", async function () {
				const { merchant } = await loadFixture(deployMerchantFixture);

				await merchant.addItem("Consistency Test", 555, 777);

				const [name1, price1, quantity1] = await merchant.getItem(0);
				const [name2, price2, quantity2] =
					await merchant.getItemNotLocalVariable(0);
				const struct = await merchant.getStructItem(0);

				expect(name1)
					.to.equal(name2)
					.to.equal(struct.name)
					.to.equal("Consistency Test");
				expect(price1).to.equal(price2).to.equal(struct.price).to.equal(555);
				expect(quantity1)
					.to.equal(quantity2)
					.to.equal(struct.quantity)
					.to.equal(777);
			});

			it("Should revert when accessing non-existent item", async function () {
				const { merchant } = await loadFixture(deployMerchantFixture);

				await expect(merchant.getItem(0)).to.be.reverted;
				await expect(merchant.getItemNotLocalVariable(0)).to.be.reverted;
				await expect(merchant.getStructItem(0)).to.be.reverted;

				await merchant.addItem("Single Item", 100, 1);

				await expect(merchant.getItem(1)).to.be.reverted;
				await expect(merchant.getItemNotLocalVariable(1)).to.be.reverted;
				await expect(merchant.getStructItem(1)).to.be.reverted;
			});
		});

		describe("Edge Cases", function () {
			it("Should handle very long item names", async function () {
				const { merchant } = await loadFixture(deployMerchantFixture);

				const longName = "A".repeat(1000);
				await merchant.addItem(longName, 100, 1);

				const [name, price, quantity] = await merchant.getItem(0);
				expect(name).to.equal(longName);
				expect(price).to.equal(100);
				expect(quantity).to.equal(1);
			});

			it("Should handle special characters in item names", async function () {
				const { merchant } = await loadFixture(deployMerchantFixture);

				const specialName = "Item with émojis 🍎 and special chars: @#$%^&*()";
				await merchant.addItem(specialName, 100, 1);

				const [name, price, quantity] = await merchant.getItem(0);
				expect(name).to.equal(specialName);
			});

			it("Should maintain correct item indices after multiple additions", async function () {
				const { merchant } = await loadFixture(deployMerchantFixture);

				const items = [
					{ name: "Item 0", price: 100, quantity: 10 },
					{ name: "Item 1", price: 200, quantity: 20 },
					{ name: "Item 2", price: 300, quantity: 30 },
					{ name: "Item 3", price: 400, quantity: 40 },
					{ name: "Item 4", price: 500, quantity: 50 },
				];

				for (let i = 0; i < items.length; i++) {
					await merchant.addItem(
						items[i].name,
						items[i].price,
						items[i].quantity,
					);
				}

				for (let i = 0; i < items.length; i++) {
					const [name, price, quantity] = await merchant.getItem(i);
					expect(name).to.equal(items[i].name);
					expect(price).to.equal(items[i].price);
					expect(quantity).to.equal(items[i].quantity);
				}
			});
		});
	});

	describe("Gas Usage Comparisons", function () {
		describe("Adding Items - Gas Comparison", function () {
			it("Should compare gas usage: addItem vs addStructItem", async function () {
				const { merchant } = await loadFixture(deployMerchantFixture);

				const itemName = "Gas Test Item";
				const itemPrice = 1000;
				const itemQuantity = 100;

				// Test addItem gas usage
				const tx1 = await merchant.addItem(itemName, itemPrice, itemQuantity);
				const receipt1 = await tx1.wait();
				const gasUsed1 = receipt1!.gasUsed;

				// Test addStructItem gas usage
				const item = {
					name: itemName,
					price: itemPrice,
					quantity: itemQuantity,
				};
				const tx2 = await merchant.addStructItem(item);
				const receipt2 = await tx2.wait();
				const gasUsed2 = receipt2!.gasUsed;

				console.log(`\n📊 Gas Usage Comparison - Adding Items:`);
				console.log(`   addItem():       ${gasUsed1.toString()} gas`);
				console.log(`   addStructItem(): ${gasUsed2.toString()} gas`);
				console.log(
					`   Difference:      ${(gasUsed1 - gasUsed2).toString()} gas`,
				);
				console.log(
					`   More efficient:  ${gasUsed1 < gasUsed2 ? "addItem()" : gasUsed2 < gasUsed1 ? "addStructItem()" : "Same"}`,
				);

				// Both should successfully add items
				expect(gasUsed1).to.be.greaterThan(0);
				expect(gasUsed2).to.be.greaterThan(0);
			});

			it("Should compare gas with different item name lengths", async function () {
				const { merchant } = await loadFixture(deployMerchantFixture);

				const shortName = "A";
				const longName = "Very Long Item Name That Uses More Storage Space";
				const price = 500;
				const quantity = 50;

				// Short name comparison
				const tx1Short = await merchant.addItem(shortName, price, quantity);
				const receipt1Short = await tx1Short.wait();
				const gasUsed1Short = receipt1Short!.gasUsed;

				const tx2Short = await merchant.addStructItem({
					name: shortName,
					price,
					quantity,
				});
				const receipt2Short = await tx2Short.wait();
				const gasUsed2Short = receipt2Short!.gasUsed;

				// Long name comparison
				const tx1Long = await merchant.addItem(longName, price, quantity);
				const receipt1Long = await tx1Long.wait();
				const gasUsed1Long = receipt1Long!.gasUsed;

				const tx2Long = await merchant.addStructItem({
					name: longName,
					price,
					quantity,
				});
				const receipt2Long = await tx2Long.wait();
				const gasUsed2Long = receipt2Long!.gasUsed;

				console.log(`\n📊 Gas Usage by Name Length:`);
				console.log(`   Short name (${shortName.length} char):`);
				console.log(`     addItem():       ${gasUsed1Short.toString()} gas`);
				console.log(`     addStructItem(): ${gasUsed2Short.toString()} gas`);
				console.log(`   Long name (${longName.length} chars):`);
				console.log(`     addItem():       ${gasUsed1Long.toString()} gas`);
				console.log(`     addStructItem(): ${gasUsed2Long.toString()} gas`);
				console.log(
					`   Name length impact: ${(gasUsed1Long - gasUsed1Short).toString()} gas difference`,
				);
			});
		});

		describe("Retrieving Items - Gas Comparison", function () {
			it("Should compare gas usage: getItem vs getItemNotLocalVariable vs getStructItem", async function () {
				const { merchant } = await loadFixture(deployMerchantFixture);

				// Add an item first
				await merchant.addItem("Gas Comparison Item", 2000, 200);

				// Test getItem gas usage
				const tx1 = await merchant.getItem.staticCall(0);
				const gasEstimate1 = await merchant.getItem.estimateGas(0);

				// Test getItemNotLocalVariable gas usage
				const tx2 = await merchant.getItemNotLocalVariable.staticCall(0);
				const gasEstimate2 =
					await merchant.getItemNotLocalVariable.estimateGas(0);

				// Test getStructItem gas usage
				const tx3 = await merchant.getStructItem.staticCall(0);
				const gasEstimate3 = await merchant.getStructItem.estimateGas(0);

				console.log(`\n📊 Gas Usage Comparison - Retrieving Items:`);
				console.log(
					`   getItem():                ${gasEstimate1.toString()} gas`,
				);
				console.log(
					`   getItemNotLocalVariable(): ${gasEstimate2.toString()} gas`,
				);
				console.log(
					`   getStructItem():          ${gasEstimate3.toString()} gas`,
				);

				// Find the most efficient
				const gasAmounts = [
					{ name: "getItem()", gas: gasEstimate1 },
					{ name: "getItemNotLocalVariable()", gas: gasEstimate2 },
					{ name: "getStructItem()", gas: gasEstimate3 },
				];

				const mostEfficient = gasAmounts.reduce((prev, current) =>
					prev.gas < current.gas ? prev : current,
				);

				console.log(`   Most efficient:           ${mostEfficient.name}`);

				// Verify all return the same data
				expect(tx1[0]).to.equal("Gas Comparison Item");
				expect(tx2[0]).to.equal("Gas Comparison Item");
				expect(tx3.name).to.equal("Gas Comparison Item");
			});

			it("Should compare gas usage with different string lengths", async function () {
				const { merchant } = await loadFixture(deployMerchantFixture);

				const shortName = "A";
				const mediumName = "Medium Length Item Name";
				const longName =
					"This is a very long item name that will use more gas when retrieving due to string length";

				// Add items with different name lengths
				await merchant.addItem(shortName, 100, 10);
				await merchant.addItem(mediumName, 200, 20);
				await merchant.addItem(longName, 300, 30);

				// Compare gas usage for each string length
				const results = [];

				for (let i = 0; i < 3; i++) {
					const gas1 = await merchant.getItem.estimateGas(i);
					const gas2 = await merchant.getItemNotLocalVariable.estimateGas(i);
					const gas3 = await merchant.getStructItem.estimateGas(i);

					const itemName =
						i === 0 ? shortName : i === 1 ? mediumName : longName;
					results.push({
						name: itemName,
						length: itemName.length,
						getItem: gas1,
						getItemNotLocalVariable: gas2,
						getStructItem: gas3,
					});
				}

				console.log(`\n📊 Gas Usage by String Length:`);
				results.forEach((result, index) => {
					console.log(`   Item ${index} (${result.length} chars):`);
					console.log(
						`     getItem():                ${result.getItem.toString()} gas`,
					);
					console.log(
						`     getItemNotLocalVariable(): ${result.getItemNotLocalVariable.toString()} gas`,
					);
					console.log(
						`     getStructItem():          ${result.getStructItem.toString()} gas`,
					);
				});

				// Analyze the impact of string length
				const shortGas = results[0].getItem;
				const longGas = results[2].getItem;
				console.log(
					`   String length impact: ${(longGas - shortGas).toString()} gas difference`,
				);
			});
		});

		describe("Comprehensive Gas Analysis", function () {
			it("Should provide a complete gas usage summary", async function () {
				const { merchant } = await loadFixture(deployMerchantFixture);

				const testItem = {
					name: "Comprehensive Test Item",
					price: 1500,
					quantity: 150,
				};

				console.log(`\n🔍 Comprehensive Gas Analysis Summary:`);
				console.log(`=====================================`);

				// Adding functions
				const addItemTx = await merchant.addItem(
					testItem.name,
					testItem.price,
					testItem.quantity,
				);
				const addItemReceipt = await addItemTx.wait();
				const addStructItemTx = await merchant.addStructItem(testItem);
				const addStructItemReceipt = await addStructItemTx.wait();

				console.log(`\n📝 ADDING ITEMS:`);
				console.log(
					`   addItem():       ${addItemReceipt!.gasUsed.toString()} gas`,
				);
				console.log(
					`   addStructItem(): ${addStructItemReceipt!.gasUsed.toString()} gas`,
				);

				// Reading functions
				const getItemGas = await merchant.getItem.estimateGas(0);
				const getItemNotLocalGas =
					await merchant.getItemNotLocalVariable.estimateGas(0);
				const getStructItemGas = await merchant.getStructItem.estimateGas(0);

				console.log(`\n📖 READING ITEMS:`);
				console.log(
					`   getItem():                ${getItemGas.toString()} gas`,
				);
				console.log(
					`   getItemNotLocalVariable(): ${getItemNotLocalGas.toString()} gas`,
				);
				console.log(
					`   getStructItem():          ${getStructItemGas.toString()} gas`,
				);

				console.log(`\n💡 RECOMMENDATIONS:`);
				console.log(
					`   - For adding: Use ${addItemReceipt!.gasUsed < addStructItemReceipt!.gasUsed ? "addItem()" : "addStructItem()"} (more efficient)`,
				);
				console.log(
					`   - For reading: Use ${
						getItemGas < getItemNotLocalGas && getItemGas < getStructItemGas
							? "getItem()"
							: getItemNotLocalGas < getStructItemGas
								? "getItemNotLocalVariable()"
								: "getStructItem()"
					} (most efficient)`,
				);

				// All functions should work correctly
				expect(addItemReceipt!.gasUsed).to.be.greaterThan(0);
				expect(addStructItemReceipt!.gasUsed).to.be.greaterThan(0);
				expect(getItemGas).to.be.greaterThan(0);
				expect(getItemNotLocalGas).to.be.greaterThan(0);
				expect(getStructItemGas).to.be.greaterThan(0);
			});
		});
	});
});
