const assert = require("assert");
const ganache = require("ganache-cli");
//Web3 constructor
const Web3 = require("web3");
//web3 instancessss, with an option to increase the gas limit to test the contract
const options = { gasLimit: 1000000000 };
const web3 = new Web3(ganache.provider(options));

const compiledTaskTreasure = require("../ethereum/build/TaskRewardTreasure.json");
const compiledTransfer = require("../ethereum/build/TransferFunds.json");

let accounts;
let treasure;
let transfer;

beforeEach(async() => {

    //Created by ganache and give us 10 address to use
    accounts = await web3.eth.getAccounts();
    
    //console.log("Attempting to deploy from account", accounts[0]);
    treasure = await new web3.eth.Contract(compiledTaskTreasure.abi)
    .deploy({ data: compiledTaskTreasure.evm.bytecode.object })
    .send( { from: accounts[0], gas: "1000000000" } );
    //console.log("Config", taskTreasureConfig.options.address);

    transfer = await new web3.eth.Contract(compiledTransfer.abi)
    .deploy({ data: compiledTransfer.evm.bytecode.object })
    .send( { from: accounts[0], gas: "1000000000" } );
    
});

describe("Treasure", () => {

    it("deploys a treasure contract", () => {
        assert.ok(treasure.options.address);
    });

    it('only owner can add approvers', async () => {
        try {
          await treasure.methods
          .addApprover(accounts[2])
          .send({
            gas: '1000000',
            from: accounts[1]
          });
          assert(false);
        } catch (err) {
          assert(err);
        }
      });

      it('approver added by manager', async () => {
        await treasure.methods
          .addApprover(accounts[1])
          .send({
            from: accounts[0],
            gas: '1000000'
          });
        const request = await treasure.methods.approvers(accounts[1]).call();
        assert(request);
      });

      it('only owner can remove approvers', async () => {

        await treasure.methods
        .addApprover(accounts[2])
        .send({
            gas: '1000000',
            from: accounts[0]
        });

        try {
          await treasure.methods
          .removeApprover(accounts[2])
          .send({
            gas: '1000000',
            from: accounts[1]
          });
          assert(false);
        } catch (err) {
          assert(err);
        }
      });

      describe("request", () => {

        it('owner create a new request', async () => {

            await treasure.methods
            .createRequest('Buy batteries', '100', accounts[1])
            .send({
                gas: '1000000',
                from: accounts[0]
            });

            const request = await treasure.methods.requests(0).call();
            assert.equal('Buy batteries', request.description);
        });

        it('only owner or approve can create a new request', async () => {

            try {
                await treasure.methods
                .createRequest('Buy batteries', '100', accounts[1])
                .send({
                    gas: '1000000',
                    from: accounts[2]
                });
    
                assert(false);
              } catch (err) {
                assert(err);
              }
        });

        it('approver create a new request', async () => {

            await treasure.methods
            .addApprover(accounts[2])
            .send({
                gas: '1000000',
                from: accounts[0]
            });
    
            await treasure.methods
            .createRequest('Buy computer', '100', accounts[1])
            .send({
              gas: '1000000',
              from: accounts[2]
            });

            const request = await treasure.methods.requests(0).call();
            assert.equal('Buy computer', request.description);
        });

        it('process a request', async () => {

            await transfer.methods
            .transfer(treasure.options.address)
            .send({
                from: accounts[0],
                value: web3.utils.toWei('10', 'ether')
            });

            await treasure.methods
            .addApprover(accounts[0])
            .send({
                gas: '1000000',
                from: accounts[0]
            });

            await treasure.methods
            .addApprover(accounts[1])
            .send({
                gas: '1000000',
                from: accounts[0]
            });

            await treasure.methods
            .addApprover(accounts[2])
            .send({
                gas: '1000000',
                from: accounts[0]
            });
           
            await treasure.methods
            .createRequest('Buy computer', web3.utils.toWei('5', 'ether'), accounts[5])
            .send({
              gas: '1000000',
              from: accounts[0]
            });

            await treasure.methods
            .approveRequest(0)
            .send({
                gas: '1000000',
                from: accounts[0]
            });

            await treasure.methods
            .approveRequest(0)
            .send({
                gas: '1000000',
                from: accounts[2]
            });
            
            await treasure.methods
            .finalizeRequest(0)
            .send({
                gas: '1000000',
                from: accounts[0]
            });

            let balance = await web3.eth.getBalance(accounts[5]);
            balance = web3.utils.fromWei(balance, 'ether');
            balance = parseFloat(balance);

            assert(balance > 104);
        });

      });

});
