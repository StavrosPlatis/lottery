import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import web3 from './web3';
import lottery from './lottery';

class App extends Component {
  state = {
    owner: '',
    items: [],
    winners: [],
    balance: '',
    value: '',
    message: ''
  };

  // Η componentDidMount() καλείται ΜΟΝΟ την πρώτη φορά
  // που φορτώνει η ιστοσελίδα (είναι σαν την onLoad())
  async componentDidMount() {
    // Whenever a different wallet is selected in MetaMask...
    window.ethereum.on('accountsChanged', (accounts) => {
      // ... reload the page, i.e., call componentDidMount()
      window.location.reload();
    });
  
    try {
      // Set the initial state variables
      const owner = await lottery.methods.owner().call();
      const items = await lottery.methods.getItems().call();
      const winners = await lottery.methods.getWinners().call();
      const balance = await web3.eth.getBalance(lottery.options.address);
      const currentAccount = (await web3.eth.getAccounts())[0];
  
      this.setState({ owner, items, winners, balance, currentAccount });
  
      // Set up the event listener for BidderEnteredItem event
      lottery.events.BidderEnteredItem({}, (error, event) => {
        if (!error) {
          const bidder = event.returnValues.bidder;
          const itemId = event.returnValues.itemId;
          window.alert(`Bidder ${bidder} entered item ${itemId}`);
        } else {
          console.error(error);
        }
      });
    } catch (error) {
      console.error(error);
    }
  }
  

  onClickBid = async itemId => {
  this.setState({ message: 'Waiting on transaction success...' });

    try {
      await lottery.methods.bid(itemId).send({
        from: this.state.currentAccount,
        value: web3.utils.toWei('0.01', 'ether'),
      });
    } catch (error) {
      if (error.message.includes('Owner cannot bid')) {
          window.alert('Owner cannot bid');
      } else if (error.message.includes('Winners have been selected')) {
          window.alert('Winners have been selected');
      } else if (error.message.includes('Not enough eth')) {
          window.alert('Not enough eth');
      } else {
          window.alert('An error occurred during the bid!');
      }
  }
  
  };

  onClickDeclare = async () => {
    this.setState({ message: 'The draw is taking place...' });
  
    try {
      await lottery.methods.declareWinner().send({
        from: this.state.currentAccount
      });
  
      const winners = await lottery.methods.getWinners().call(); // Fetch the updated winners array
      window.alert("Winners have been declared");
      this.setState({ winners });
    } catch (error) {
      window.alert("An error occured");
    }
  };

  onClickAmIAWinner = async () => {
    this.setState({ message: 'Checking if you won an item...' });
  
    try {
        const result = await lottery.methods.amIAWinner().send({
        from: this.state.currentAccount
      });
  
      if (result === "Congratulations! You are a winner.") {
        window.alert(result.toString());
      } else {
        window.alert(result.toString());
      }
    } catch (error) {
      this.setState({ message: 'An error occurred while checking winner status!' });
    }
  };
  


  // Κάθε φορά που η σελίδα γίνεται refresh
  render() {
    return (
      <div className='text-center'>
        <h1>Lottery-Ballot</h1>
        <hr />
        <div className="item-container row">
          <div className="item col-sm-4">
            <h3>car</h3>
            <p>Description of Item 1</p>
            <button onClick={() => this.onClickBid(0)}>Bid</button>
          </div>
          <div className="item col-sm-4">
            <h3>phone</h3>
            <p>Description of Item 2</p>
            <button onClick={() => this.onClickBid(1)}>Bid</button>
          </div>
          <div className="item col-sm-4">
            <h3>computer</h3>
            <p>Description of Item 3</p>
            <button onClick={() => this.onClickBid(2)}>Bid</button>
          </div>
        </div>
        <hr />
        <div className="item-container row">
          <div className="item col-sm-8">
            <label>Current Account:</label>
            <input
              value={this.state.currentAccount}
              onChange={event => this.setState({ value: event.target.currentAccount })}
              className="w-50 border-0"
              />
          </div>
          <div className="item col-sm-4">
            <label>Owner's Account:</label>
            <input
              value={this.state.owner}
              className="w-50 border-0"
            />
          </div>
        </div>
        <div className="item-container row">
          <div className="item col-sm-2">
            <button onClick={this.onClickAmIAWinner}>Am I A Winner</button>
          </div>
          <div className="item col-sm-8">
          </div>
          <div className="item col-sm-2">
            <div className="row">
              <div className="col-sm-12">
                <button onClick={this.onClickDeclare}>Declare Winners</button>
              </div>
              <div className="col-sm-12">
                <button>Withdraw</button>
              </div>
            </div>
          </div>
        </div>
        <hr />
        <h2>{this.state.message}</h2>
      </div>
    );
  }
  
}

export default App;
