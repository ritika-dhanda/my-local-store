// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LocalStore {
    struct Product {
        uint id;
        string name;
        uint price;
        uint quantity;
    }

    mapping(uint => Product) public products;
    uint public nextProductId;
    address public owner;

    event ProductAdded(uint productId, string name, uint price, uint quantity);
    event ProductPurchased(uint productId, uint quantity);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addProduct(string memory name, uint price, uint quantity) public onlyOwner {
        products[nextProductId] = Product(nextProductId, name, price, quantity);
        emit ProductAdded(nextProductId, name, price, quantity);
        nextProductId++;
    }

    function purchaseProduct(uint productId, uint quantity) public payable {
        Product storage product = products[productId];
        require(product.id == productId, "Product does not exist");
        require(product.quantity >= quantity, "Not enough quantity in stock");
        require(msg.value >= product.price * quantity, "Insufficient Ether sent");

        product.quantity -= quantity;
        emit ProductPurchased(productId, quantity);
    }

    function getBalance() public view onlyOwner returns(uint) {
        return address(this).balance;
    }

    function withdraw() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}

