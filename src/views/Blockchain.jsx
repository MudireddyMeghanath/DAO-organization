import Web3 from "web3";
import {setGlobalState,getGlobalState} from "./store";
import abi from "./abis/DAO.json"
const {ethereum}=window
window.web3=new Web3(ethereum);
window.web3=new Web3(window.web3.currentProvider)
const connectWallet= async()=>{
    try{
        if(!ethereum) return alert("please have metamask")
        const accounts=await ethereum.request({method:"eth_requestAccount",})
        setGlobalState('connectedAccont',accounts[0].toLowerCase()) //work with account for transations for the page
}catch(e){
    reportError(e.message)

}
}
const isWalletConnected=async()=>{
    try{
        if(!ethereum) return alert("please have metamask");
        const accounts=await ethereum.request({method:"eth_accounts",})
        window.ethereum.on('chainChainged',(chainId)=>{
            window.location.reload();
        })
        window.ethereum.on('accountsChanged',async()=>{
            setGlobalState('connectedAccount',accounts[0].toLowerCase());
            await isWalletConnected();
        })
        if(accounts.length){
            setGlobalState('connectedAccount',accounts[0].toLowerCase());
        }else{
            alert("please have metamask");
            console.log("no acc found");
        }

    }catch(e){
        reportError(e.message);
    }

    
}
const getEthereumContract=async()=>{
    const connectedAccont=getGlobalState("connectedAccount");
    if(connectedAccont){
        const web3=window.web3;
        const networkId=await web3.eth.net.getId();
        const networkData=await abi.networks[networkId];
        if(networkData){
            const contract =new web3.eth.Contract(abi.abi,networkData.address)
            return contract
        }else{
            return null;
        }
    }else{
        return getGlobalState("contract");
    }
}
const performContribute=async(amount)=>{
    try{
        amount=window.web3.utils.toWei(amount.toString(),ether);
        const contract=await getEthereumContract();
      const  account=getGlobalState('connectedAccount')
      await contract.method.contribute().sender({from:account,value:amount})
      window.location.reload();
    }catch(e){
        reportError(e.message);
        return e;

    }
}
const getInfo=async()=>{
    try{
        if(!ethereum) return alert("ethereum metamask not found");
        const contract=await getEthereumContract();
        const connectedAccount=getGlobalState('connectedAccount')
        const isStakeholder=await contract.methods.isStakeholder().call({from:connectedAccount})
        const balance=await contract.methods.daoBalance().call();
        const myBalance=await contract.methods.getbalance().call({from:connectedAccount});
        setGlobalState('Balance',window.web3.utils.fromWei(balance))
        setGlobalState('myBalance',window.web3.utils.fromWei(myBalance))
        setGlobalState("isStakeholder",isStakeholder)


    }catch(e){
        reportError(error);

    }
   
}
const raiseProposal=async({title,description,beneficiary,amount})=>{
    try{
        amount=window.web3.utils.toWei(amount.toString(),'ether');
        const contract=await getEthereumContract();
        const account=getGlobalState('connectedAccount')
        await contract.methods.createProposal(title,description,beneficiary,amount).send({from:account});
        window.location.reload()
    }catch(err){
        console.log(err.message);
     }
}
const getProposals=async()=>{
    try{
        if(!ethereum) return alert("metamask");
        const contract =await getEthereumContract();
        const proposals=await contract.methods.getProposals().call()
        setGlobalState('proposals',structuredProposals(proposals))
    }catch(e){
        reportError(e);
    }
}
const structuredProposals=(proposals)=>{
    return proposals.map((proposal)=>({
        id:proposal.id,
        amount:window.web3.utils.fromWei(proposal.amount),
        title:proposal.title,
        description:proposal.description,
        paid:proposal.paid,
        passed:proposal.passed,
        proposer:proposal.proposer,
        upvotes:Number(proposal.upvotes),
        downvotes:Number(propsal.downvotes),
        beneficiary:proposal.beneficiary,
        executor:proposal.executor,
        duration:proposal.duration

    }))

}
const getproposal=async(id)=>{
    try{
        const propsals=getGlobalState('proposals');
        return propsals.find((proposal)=>proposal.id==id);
    }catch(e){
        reportError(e);
    }
}
const voteOnProposal=async(proposalId,supported)=>{
    try{
        const contract=await getEthereumContract()
        const account=getGlobalState('connectedAccount')
        await contract.methods.Vote(proposalId,supported).send({from:account})
        window.location.reload();
    }catch(e){
        reportError(e);
    }

}
const listVoters=async(id)=>{
    try{
        const contract =await getEthereumContract();
        const votes=await contract.methods.getVotesOf(id).call();
        return votes
    }catch(e){
        reportError(e);
    }
}
const payoutBeneficiary=async(id)=>{
    try{
        const contract =await getEthereumContract();
        const account=getGlobalState('connectedAccount');
        await contract.methods.payBeneficiary(id).send({from:account});
        window.location.reload();

    }catch(e){
        reportError(e);
    }
}
const reportError=(err)=>{
    console.log(JSON.stringify(err),'red');
    throw new Error("No etherrum account found")

}
export {
    isWalletConnected,
    connectWallet,
    performContribute,
    getInfo,
    raiseProposal,
    getProposals,
    getproposal,
    voteOnProposal,
    listVoters,
    payoutBeneficiary
}