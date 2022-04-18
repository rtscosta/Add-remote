//This is the pre-configure instance of the task that can be used in all the project
import web3 from "./web3";
import taskRewardTreasure from "./build/TaskRewardTreasure.json";

const instance = new web3.eth.Contract(
    taskRewardTreasure.abi,
    "0x60d2d4D1eb825424390222745C592a983CDd5500" //Factory Contract address save on the block chain after run  deployed.js
);

export default instance;
