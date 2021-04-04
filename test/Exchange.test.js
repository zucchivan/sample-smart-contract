const Token = artifacts.require('Token');
const Exchange = artifacts.require('Exchange');

require('chai')
	.use(require('chai-as-promised'))
	.should()

function tokens(n) {
	// As the sample Token has 18 decimal places, like Ether, we can use the same utils functions for conversions 
	return web3.utils.toWei(n, 'ether')
}

contract('Exchange', ([deployer, investor]) => {
	let token, exchange;

	before(async () => {
		token = await Token.new()
		exchange = await Exchange.new(token.address)
		// Following the migration file, transfer all the tokens to the exchange
		await token.transfer(exchange.address, tokens('1000000'));
	})

	describe('Token deployment', async () => {
		it('contract has a name', async () => {
			const name = await token.name();
			assert.equal(name, 'Sample Token');
		})
	})

	describe('Exchange deployment', async () => {
		it('contract has a name', async () => {
			const name = await exchange.name();
			assert.equal(name, 'Sample Smart Contract of an exchange');
		})

		it('contract has tokens', async () => {
			let balance = await token.balanceOf(exchange.address);
			assert.equal(balance.toString(), tokens('1000000'));
		})
	})

	describe('buyTokens()', async () => {
		let result;

		before(async () => {
			// Purchase tokens before each example
			result = await exchange.buyTokens({ from: investor, value: web3.utils.toWei('1', 'ether')});
		})

		it('Allow users to instantly purchase tokens from the exchange for a fixed price', async () => {
			// Check investor's balance after purchase
			let investorBalance = await token.balanceOf(investor);
			assert.equal(investorBalance.toString(), tokens('100'));

			// Check exchange's balance after sale
			let exchangeBalance = await token.balanceOf(exchange.address);
			assert.equal(exchangeBalance.toString(), tokens('999900'));

			exchangeBalance = await web3.eth.getBalance(exchange.address);
			assert.equal(exchangeBalance.toString(), web3.utils.toWei('1', 'Ether'));

			// Check if event was correcly emitted
			const event = result.logs[0].args;
			assert.equal(event.account, investor);
			assert.equal(event.token, token.address);
			assert.equal(event.amount.toString(), tokens('100').toString());
			assert.equal(event.rate.toString(), '100');
		})
	})

	describe('sellTokens()', async () => {
		let result;

		before(async () => {
			// The investor must ask for approval before the purchase
			await token.approve(exchange.address, tokens('100'), { from: investor });

			result = await exchange.sellTokens(tokens('100'), { from: investor });
		})

		it('Allow users to instantly sell tokens to the exchange for a fixed price', async () => {
			let investorBalance = await token.balanceOf(investor);
			assert.equal(investorBalance.toString(), tokens('0'));

			let exchangeBalance = await token.balanceOf(exchange.address);
			assert.equal(exchangeBalance.toString(), tokens('1000000'));

			const event = result.logs[0].args;
			assert.equal(event.account, investor);
			assert.equal(event.token, token.address);
			assert.equal(event.amount.toString(), tokens('100').toString());
			assert.equal(event.rate.toString(), '100');

			await exchange.sellTokens(tokens('500', { from: investor})).should.be.rejected;
		})
	})



})