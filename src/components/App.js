import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import Navbar from "./Navbar";
import SampleToken from "../abis/SampleToken.json";
import SampleSmartContract from "../abis/SampleSmartContract.json";
import Main from './Main';


class App extends Component {

  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
    console.log(window.web3);
  }

  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    const ethBalance = await web3.eth.getBalance(this.state.account)
    this.setState({ ethBalance })
    console.log(this.state.ethBalance)

    // Load SampleToken
    const networkId = await web3.eth.net.getId()
    const tokenData = SampleToken.networks[networkId]
    if(tokenData) {
      const token = new web3.eth.Contract(SampleToken.abi, tokenData.address)
      this.setState({ token })
      let tokenBalance = await token.methods.balanceOf(this.state.account).call()
      this.setState({ tokenBalance: tokenBalance.toString() })
    } else {
      window.alert('SampleToken contract not deployed to detected network.')
    }

    // Load SampleSmartContract
    const sampleSmartContractData = SampleSmartContract.networks[networkId]
    if(sampleSmartContractData) {
      const sampleSmartContract = new web3.eth.Contract(SampleSmartContract.abi, sampleSmartContractData.address)
      this.setState({ sampleSmartContract })
    } else {
      window.alert('SampleSmartContract contract not deployed to detected network.')
    }

    this.setState({ loading: false })
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }

  buyTokens = (etherAmount) => {
    this.setState({ loading: true })
    this.state.sampleSmartContract.methods.buyTokens().send({ value: etherAmount, from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      token: {},
      sampleSmartContract: {},
      ethBalance: '0',
      tokenBalance: '0',
      loading: true
    }
  }

  render() {
    let content

    if(this.state.loading) {
      content = <p id="loader" className="text-center">Loading...</p>
    } else {
      content = <Main
        ethBalance={this.state.ethBalance}
        tokenBalance={this.state.tokenBalance}
        buyTokens={this.buyTokens}
      />
    }

    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                {content}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
