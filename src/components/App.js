import DStorage from '../abis/DStorage.json'
import React, { Component } from 'react';
import Navbar from './Navbar'
import Main from './Main'
import Web3 from 'web3';
import './App.css';

//Declare IPFS
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values


class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    //Setting up Web3
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    //Declare Web3
    const web3 = window.web3;
    //console.log(web3);

    //Load account
    const accounts = await web3.eth.getAccounts();
    //console.log(accounts);
    this.setState({ account: accounts[0] });

    //Network ID
    const networkId = await web3.eth.net.getId()
    const networkData = DStorage.networks[networkId]
    if (networkData) {
      // Assign contract
      const dstorage = new web3.eth.Contract(DStorage.abi, networkData.address)
      this.setState({ dstorage })
      // Get files amount
      const filesCount = await dstorage.methods.fileCount().call()

      this.setState({ filesCount })
      // Load files&sort by the newest
      for (var i = filesCount; i >= 1; i--) {
        const file = await dstorage.methods.files(i).call()
        this.setState({
          files: [...this.state.files, file]
        })
      }
    } else {
      window.alert('DStorage contract not deployed to detected network.')
    }
    this.setState({ loading: false });

  }


  // Get file from user
  captureFile = event => {
    event.preventDefault()

    const file = event.target.files[0]
    //native file reader
    const reader = new window.FileReader()

    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({
        buffer: Buffer(reader.result),
        type: file.type,
        name: file.name
      })
      console.log('buffer', this.state.buffer)
    }
  }


  //Upload File
  uploadFile = description => {
    console.log("Submitting file to IPFS...")

    // Add file to the IPFS
    ipfs.add(this.state.buffer, (error, result) => {
      console.log('IPFS result', result)
      if (error) {
        console.error(error)
        return
      }

      this.setState({ loading: true })
      //Assign value for the file without extension
      if (this.state.type === '') {
        this.setState({ type: 'none' })
      }
      this.state.dstorage.methods.uploadFile(result[0].hash, result[0].size, this.state.type, this.state.name, description).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({
          loading: false,
          type: null,
          name: null
        })
        window.location.reload()
      }).on('error', (e) => {
        window.alert('Error')
        this.setState({ loading: false })
      })
    })
  }

  //Set states
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      dstorage: null,
      files: [],
      loading: false,
      type: null,
      name: null
    }

    //Bind functions
    this.uploadFile = this.uploadFile.bind(this)
    this.captureFile = this.captureFile.bind(this)
    this.increaseUpvotes = this.increaseUpvotes.bind(this)
    this.decreaseUpvotes = this.decreaseUpvotes.bind(this)
  }
  increaseUpvotes(id) {
    console.log("id: ", id);
    // console.log(this.state.files);


    // loop over the files and find the provided id.
    let updatedList = this.state.files.map(file => {
      // console.log("mapping");
      // console.log("fileid: ", file.fileId);
      // console.log("files.length: ", this.state.files.length);
      // console.log("id: ", id);
      // console.log(this.state.files.length - id);
      if (file.fileId === id) {
        console.log("inside if id: ", id);
        const val = Number(file.upvotes) + 1;
        console.log(typeof file.upvotes);
        console.info('val:', val);
        return { ...file, upvotes: val }; //gets everything that was already in item, and updates "done"
      }
      return file; // else return unmodified item 
    });

    console.log("updated list : ", updatedList);
    this.setState({ files: updatedList }); // set state to new object with updated list
    // console.log(this.state.files);
  }
  // updateItem(id, itemAttributes) {
  //   var index = this.state.files.findIndex(x=> x.fileId === id);

  //     this.setState({
  //       files: [
  //          ...this.state.files.slice(0,index),
  //          Object.assign({}, this.state.files[index], itemAttributes),
  //          ...this.state.files.slice(index+1)
  //       ]
  //     });
  // }


  decreaseUpvotes(id) {
    // console.log(id);
    //this.updateItem(id, {upvotes: upvotes-1});
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        {this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
            files={this.state.files}
            increaseUpvotes={this.increaseUpvotes}
            decreaseUpvotes={this.decreaseUpvotes}
            captureFile={this.captureFile}
            uploadFile={this.uploadFile}
          />
        }
      </div>
    );
  }
}

export default App;