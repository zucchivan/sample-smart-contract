const Token = artifacts.require('Token');
const Exchange = artifacts.require('Exchange');

require('chai')
	.use(require('chai-as-promised'))
	.should()

contract('Exchange', (accounts) => {
	let token, exchange;

	before(async () => {
		token = await Token.new()
		exchange = await Exchange.new()
		await token.transfer(exchange.address, '1000000000000000000000000');
	})

	describe('Token deployment', async () => {
		it('contract has a name', async () => {
			const name = await token.name()
			assert.equal(name, 'Sample Token')
		})
	})

	describe('Exchange deployment', async () => {
		it('contract has a name', async () => {
			const name = await exchange.name()
			assert.equal(name, 'Sample Smart Contract of a exchange')
		})

		it('contract has tokens', async () => {
			let balance = await token.balanceOf(exchange.address)
			assert.equal(balance.toString(), '1000000000000000000000000')
		})
	})



})