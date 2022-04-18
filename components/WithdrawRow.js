import React, { Component } from 'react';
import { Table, Button } from 'semantic-ui-react';
import web3 from '../ethereum/web3';
import treasure from "../ethereum/treasure";
import { Router } from '../routes';

class WithdrawRow extends Component {
  onApprove = async () => {
    const accounts = await web3.eth.getAccounts();
    await treasure.methods.approveRequest(this.props.id).send({
      from: accounts[0]
    });

    Router.pushRoute('/');
    
  };

  onFinalize = async () => {
    
    const accounts = await web3.eth.getAccounts();
    await treasure.methods.finalizeRequest(this.props.id).send({
      from: accounts[0]
    });

    Router.pushRoute('/');
    
  };

  render() {
    const { Row, Cell } = Table;
    const { id, withdraw, approversCount, treasureBalance } = this.props;
    const readyToFinalize = withdraw.approvalCount > approversCount / 2;
    const hasBalance = Number(treasureBalance) >= Number(withdraw.value);
    //console.log(hasBalance);

    return (
      <Row disabled={withdraw.complete} positive={readyToFinalize && !withdraw.complete}>
        <Cell>{id}</Cell>
        <Cell>{withdraw.description}</Cell>
        <Cell>{web3.utils.fromWei(withdraw.value, 'ether')}</Cell>
        <Cell>{withdraw.recipient}</Cell>
        <Cell>
          {withdraw.approvalCount}/{approversCount}
        </Cell>
        <Cell>
          {withdraw.complete ? null : (
            <Button color="green" basic onClick={this.onApprove}>
              Approve
            </Button>
          )}
        </Cell>
        <Cell>
          {(withdraw.complete)? null : ( ( !hasBalance ? "Insufficient funds" :
            <Button color="teal" basic onClick={this.onFinalize}>
              Finalize
            </Button>
          ))}
        </Cell>
      </Row>
    );
  }
}

export default WithdrawRow;