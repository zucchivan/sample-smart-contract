const Token = artifacts.require('Token');
const Exchange = artifacts.require('Exchange');

module.exports = async function(deployer) {
  await deployer.deploy(Token);
  const token = await Token.deployed();

  await deployer.deploy(Exchange);
  const exchange = await Exchange.deployed();

  // Transfer all tokens to the Sample Smart Contract (1 million)
  await token.transfer(exchange.address, '1000000000000000000000000');
};
