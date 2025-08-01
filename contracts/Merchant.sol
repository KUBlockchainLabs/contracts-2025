// SPDX-License-Identifier: AGPLv3
pragma solidity ^0.8.21;

contract Merchant {
	struct Item {
		string name;
		uint256 price;
		uint40 quantity;
	}

	Item[] internal _items;

	function addItem(
		string calldata _name,
		uint _price,
		uint40 _quantity
	) public {
		Item memory item = Item(_name, _price, _quantity);
		_items.push(item);
	}

	function addStructItem(Item calldata _item) public {
		_items.push(_item);
	}

	function getItem(
		uint _id
	) public view returns (string memory, uint256, uint40) {
		Item memory item = _items[_id];
		return (item.name, item.price, item.quantity);
	}

	function getItemNotLocalVariable(
		uint _id
	) public view returns (string memory, uint256, uint40) {
		return (_items[_id].name, _items[_id].price, _items[_id].quantity);
	}

	function getStructItem(uint _id) public view returns (Item memory) {
		return _items[_id];
	}
}
