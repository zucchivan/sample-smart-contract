pragma solidity ^0.5.0;

import "./Token.sol";

contract Exchange {
	// State variables are permanently stored in contract storage
	string public name = "Sample Smart Contract of an exchange";
	Token public token;
	// 1 ETH equals to 100 tokens
	uint public rate = 100;

	constructor(Token _token) public {
		/* 
		  _token is a constructor arg (acts like a local variable) 
		  and only gets stored in the blockchain if we assign it 
		  to a state variable like below
		*/
		token = _token;
	}

	event TokensPurchased(
		address account,
		address token,
		uint amount,
		uint rate
	);

	event TokensSold(
		address account,
		address token,
		uint amount,
		uint rate
	);

	/*
	  "payable" keyword signs a function to have a mechanism to collect
	  and receive funds in ethers to the contract
	*/
	function buyTokens() public payable {
		/* 
		  Redemption rate = number of tokens received for 1 ether
		  tokenAmount = amount of Ether * redemption rate
		*/
		uint tokenAmount = msg.value * rate;

		/*
		  Following line requires the exchange to have enough balance
		  for the operation to continue. "this" keyword binds to the 
		  address of the smart contract
		*/
		require(token.balanceOf(address(this)) >= tokenAmount);

		// msg is a global variable in solidity (representing the function caller)
		token.transfer(msg.sender, tokenAmount); 

		emit TokensPurchased(msg.sender, address(token), tokenAmount, rate);
	}

	function sellTokens(uint _amount) public {
		// Require the user to have enough amount of tokens
		require(token.balanceOf(msg.sender) >= _amount);

		// Ether redemption amount = amount of tokens to sell / rate 
		uint etherAmount = _amount / rate;

		// Require the exchange to have enough amount of ether
		require(address(this).balance >= etherAmount);

		token.transferFrom(msg.sender, address(this), _amount);
		msg.sender.transfer(etherAmount);

		emit TokensSold(msg.sender, address(token), _amount, rate);
	}
}