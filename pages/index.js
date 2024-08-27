import { useState, useEffect } from "react";
import { ethers } from "ethers";
import store_abi from "../artifacts/contracts/LocalStore.sol/LocalStore.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [store, setStore] = useState(undefined);
  const [storeBalance, setStoreBalance] = useState(undefined); // Store contract balance
  const [accountBalance, setAccountBalance] = useState(undefined); // User account balance
  const [isHovered, setIsHovered] = useState(false);
  const [productError, setProductError] = useState("");
  const [products, setProducts] = useState([]);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your contract address
  const storeABI = store_abi.abi;

  useEffect(() => {
    const initialize = async () => {
      if (window.ethereum) {
        setEthWallet(window.ethereum);
        await getWallet();
      } else {
        alert("Please install MetaMask!");
      }
    };
    initialize();
  }, []);

  const getWallet = async () => {
    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = async (accounts) => {
    if (accounts && accounts.length > 0) {
      setAccount(accounts[0]);
      getStoreContract();
      await fetchAccountBalance(accounts[0]); // Fetch account balance
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);
  };

  const getStoreContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const storeContract = new ethers.Contract(contractAddress, storeABI, signer);

    setStore(storeContract);
    getStoreBalance(); // Fetch store balance on initialization
  };

  const fetchAccountBalance = async (account) => {
    if (ethWallet) {
      const provider = new ethers.providers.Web3Provider(ethWallet);
      try {
        const balance = await provider.getBalance(account);
        setAccountBalance(ethers.utils.formatEther(balance));
      } catch (error) {
        console.error("Error fetching account balance:", error);
      }
    }
  };

  const getStoreBalance = async () => {
    if (store && account) {
      try {
        const balance = await store.getBalance();
        setStoreBalance(ethers.utils.formatEther(balance));
      } catch (error) {
        console.error("Error fetching store balance:", error);
      }
    }
  };

  const addProduct = async () => {
    if (store) {
      const name = prompt("Enter product name:");
      const description = prompt("Enter product description:");
      const price = prompt("Enter product price in ETH:");
      const quantity = prompt("Enter product quantity:");
      const category = prompt("Enter product category:");

      if (name && description && price && quantity && category) {
        // Input validation
        if (isNaN(price) || parseFloat(price) <= 0) {
          setProductError("Invalid price value. Please enter a positive number.");
          return;
        }

        if (isNaN(quantity) || parseInt(quantity) <= 0) {
          setProductError("Invalid quantity value. Please enter a positive integer.");
          return;
        }

        try {
          const tx = await store.addProduct(name, description, ethers.utils.parseEther(price), quantity, category);
          await tx.wait();
          fetchProducts(); // Refresh products after adding a new one
          setProductError(""); // Clear error message
        } catch (error) {
          console.error("Error adding product:", error);
          setProductError("Failed to add product. Please check the console for details.");
        }
      } else {
        setProductError("All fields are required to add a product.");
      }
    }
  };

  const purchaseProduct = async (productId) => {
    if (store) {
      try {
        const tx = await store.purchaseProduct(productId, { value: ethers.utils.parseEther("1") }); // Assuming a fixed price of 1 ETH
        await tx.wait();
        fetchProducts(); // Refresh products after purchase
        getStoreBalance(); // Update store balance
        fetchAccountBalance(account); // Update account balance
      } catch (error) {
        console.error("Error purchasing product:", error);
      }
    }
  };

  const fetchProducts = async () => {
    if (store) {
      try {
        const productCount = await store.getProductCount();
        const products = [];
        for (let i = 0; i < productCount; i++) {
          const product = await store.getProduct(i);
          products.push(product);
        }
        setProducts(products);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install MetaMask to use this store.</p>;
    }

    if (!account) {
      return (
        <button onClick={connectAccount}>
          Connect MetaMask Wallet
        </button>
      );
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Account Balance: {accountBalance} ETH</p> {/* Display account balance */}
        <p>Store Balance: {storeBalance} ETH</p>
        <button onClick={addProduct}>Add Product</button>
        <div>
          <h2>Products:</h2>
          {products.length > 0 ? (
            <ul>
              {products.map((product, index) => (
                <li key={index}>
                  <p>Product ID: {product.id.toString()}</p>
                  <p>Name: {product.name}</p>
                  <p>Price: {ethers.utils.formatEther(product.price)} ETH</p>
                  <button onClick={() => purchaseProduct(product.id)}>Purchase</button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No products available</p>
          )}
        </div>
        {productError && <p className="error">Error: {productError}</p>}
      </div>
    );
  };

  return (
    <main
      className={`container ${isHovered ? "hovered" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <header>
        <h1>Welcome to the Local Store!</h1>
      </header>
      {initUser()}
      <style jsx>{`
      .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f1f1f1;
        animation: randomBackground 10s infinite;
      }

      .container.hovered {
        background-color: #d1d1d1;
      }

      .message {
        font-size: 20px;
        margin-bottom: 30px;
        color: #333;
      }

      .connect-btn {
        padding: 10px 20px;
        background-color: #3498db;
        color: #fff;
        border: none;
        border-radius: 5px;
        font-size: 18px;
        cursor: pointer;
        transition: background-color 0.3s;
        outline: none;
      }

      .connect-btn:hover,
      .connect-btn:focus {
        background-color: #2980b9;
        transform: scale(1.05);
      }

      .connect-btn:active {
        transform: scale(0.98);
      }

      .user-section {
        margin-top: 40px;
        transition: background-color 0.5s;
      }

      .user-section.hovered {
        background-color: #f39c12;
      }

      .account {
        font-size: 24px;
        margin-bottom: 10px;
        color: #fff;
      }

      .balance-container {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
      }

      .balance {
        font-size: 36px;
        font-weight: bold;
        margin-bottom: 20px;
        color: #fff;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
      }

      .balance-actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
      }

      .action-btn {
        padding: 12px 24px;
        color: #fff;
        border: none;
        border-radius: 5px;
        font-size: 18px;
        cursor: pointer;
        transition: background-color 0.3s;
        outline: none;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
      }

      .action-btn.add {
        background-color: #27ae60;
      }

      .action-btn.purchase {
        background-color: #c0392b;
      }

      .action-btn:hover,
      .action-btn:focus {
        opacity: 0.8;
        transform: scale(1.05);
      }

      .action-btn:active {
        transform: scale(0.98);
      }

      @keyframes randomBackground {
        0% {
          background-color: #f1f1f1;
        }
        25% {
          background-color: #2980b9;
        }
        50% {
          background-color: #27ae60;
        }
        75% {
          background-color: #c0392b;
        }
        100% {
          background-color: #8e44ad;
        }
      }
      `}</style>
    </main>
  );
}
