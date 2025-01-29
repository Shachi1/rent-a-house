import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import HouseRentingABI from "./HouseRenting.json"; // Smart contract ABI

const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE";

function App() {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [houses, setHouses] = useState([]);
  const [account, setAccount] = useState("");

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(web3Provider);

        const signer = web3Provider.getSigner();
        const contractInstance = new ethers.Contract(
          CONTRACT_ADDRESS,
          HouseRentingABI,
          signer
        );
        setContract(contractInstance);

        const accounts = await web3Provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
      }
    };
    init();
  }, []);

  const listHouse = async (details, rent) => {
    const tx = await contract.listHouse(details, ethers.utils.parseEther(rent));
    await tx.wait();
    alert("House listed successfully!");
  };

  const rentHouse = async (id, rent) => {
    const tx = await contract.rentHouse(id, { value: ethers.utils.parseEther(rent) });
    await tx.wait();
    alert("House rented successfully!");
  };

  const fetchHouses = async () => {
    const count = await contract.houseCount();
    const housesData = [];
    for (let i = 1; i <= count; i++) {
      const house = await contract.houses(i);
      housesData.push(house);
    }
    setHouses(housesData);
  };

  return (
    <div>
      <h1>House Renting DApp</h1>
      <button onClick={fetchHouses}>Fetch Houses</button>
      <div>
        {houses.map((house, index) => (
          <div key={index}>
            <p>Details: {house.details}</p>
            <p>Rent: {ethers.utils.formatEther(house.rent)} ETH</p>
            <button onClick={() => rentHouse(house.id, house.rent)}>Rent</button>
          </div>
        ))}
      </div>
      <div>
        <h2>List a House</h2>
        <input placeholder="Details" id="details" />
        <input placeholder="Rent in ETH" id="rent" />
        <button onClick={() => listHouse(document.getElementById("details").value, document.getElementById("rent").value)}>List</button>
      </div>
    </div>
  );
}

export default App;
