// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

contract LocalStore {
    uint256 public nextProductId;
    address public owner;

    struct Product {
        uint256 id;
        string name;
        string description;
        uint256 price;
        uint256 quantity;
        string category;
    }

    Product[] public products;

    constructor() {
        owner = msg.sender;
        nextProductId = 1;
    }

    function addProduct(
        string memory _name,
        string memory _description,
        uint256 _price,
        uint256 _quantity,
        string memory _category
    ) public {
        require(_price > 0, "Price must be greater than zero");
        require(_quantity > 0, "Quantity must be greater than zero");

        products.push(Product(nextProductId, _name, _description, _price, _quantity, _category));
        nextProductId++;
    }

    function getProduct(uint256 _productId) public view returns (Product memory) {
        require(_productId > 0 && _productId < nextProductId, "Product not found");
        return products[_productId - 1];
    }

    function getProducts() public view returns (Product[] memory) {
        return products;
    }
}


