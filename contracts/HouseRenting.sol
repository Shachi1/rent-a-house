// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HouseRenting {
    struct House {
        uint id;
        address owner;
        string details;
        uint rent;
        address tenant;
        bool isAvailable;
    }

    uint public houseCount;
    mapping(uint => House) public houses;

    event HouseListed(uint id, address owner, uint rent);
    event HouseRented(uint id, address tenant);
    event RentPaid(uint id, address tenant, uint amount);

    function listHouse(string memory details, uint rent) external {
        houseCount++;
        houses[houseCount] = House(houseCount, msg.sender, details, rent, address(0), true);
        emit HouseListed(houseCount, msg.sender, rent);
    }

    function rentHouse(uint id) external payable {
        House storage house = houses[id];
        require(house.isAvailable, "House not available");
        require(msg.value == house.rent, "Incorrect rent amount");
        house.tenant = msg.sender;
        house.isAvailable = false;
        payable(house.owner).transfer(msg.value);
        emit HouseRented(id, msg.sender);
    }

    function payRent(uint id) external payable {
        House storage house = houses[id];
        require(house.tenant == msg.sender, "Not the tenant");
        require(msg.value == house.rent, "Incorrect rent amount");
        payable(house.owner).transfer(msg.value);
        emit RentPaid(id, msg.sender, msg.value);
    }

    function terminateRental(uint id) external {
        House storage house = houses[id];
        require(house.owner == msg.sender || house.tenant == msg.sender, "Not authorized");
        house.tenant = address(0);
        house.isAvailable = true;
    }
}
