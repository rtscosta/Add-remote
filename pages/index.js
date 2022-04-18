import React, { Component } from "react";
import { Card, Button, Message, Table } from 'semantic-ui-react';
import treasure from "../ethereum/treasure";
import Layout from "../components/Layout";
import { Link } from "../routes";
import WithdrawRow from '../components/WithdrawRow';
import web3 from '../ethereum/web3';

export async function getServerSideProps() {
    const summary = await treasure.methods.getSummary().call();
    const requestCount = await treasure.methods.getRequestsCount().call();

    let withdraws = [];
    for (var i = 0; i < requestCount; i++) {
        let req = await treasure.methods.requests(i).call();
        const data = {
            description: req.description,
            value: req.value,
            recipient: req.recipient,
            complete: req.complete,
            approvalCount: req.approvalCount
        }
        //console.log(JSON.stringify(req));
        withdraws.push(data);
    } 
 
    /*
    const requests = await Promise.all(
        Array(parseInt(requestCount))
          .fill()
          .map((element, index) => {
            const req = treasure.methods.requests(index).call();
            console.log(JSON.stringify(req));
            return JSON.stringify(req);
          })
      );
    */

    //console.log(requests);

    return {
        props: {
            balance: summary[0],
            requestsCount: summary[1],
            approversCount: summary[2],
            owner: summary[3],
            withdraws: withdraws
        },
    };
};


class TreasureIndex extends Component {

    renderRows() {
        return this.props.withdraws.map((withdraw, index) => {
          return (
            <WithdrawRow
              key={index}
              id={index}
              withdraw={withdraw}
              address={this.props.address}
              approversCount={this.props.approversCount}
              treasureBalance={this.props.balance}
            />
          );
        });
    }

    renderApprover = async () => {
        const acc = await web3.eth.getAccounts();
        //console.log(acc);
        const isApprover = await treasure.methods.approvers(acc[0]).call();
        return isApprover ? "Account " + acc[0] + " is an approver" : "";
    };
    

    render() {

        const { Header, Row, HeaderCell, Body } = Table;
        const treasureInfo = web3.utils.fromWei(this.props.balance, 'ether') + " ETH on Treasure";
        const approversInfo = this.props.approversCount + " approver(s)";

        return (
            <Layout>
                <div>
                    <Message color="green" header={treasureInfo} content=""></Message>
                </div>
                <div style={{ marginTop: "10px" }}>
                    <Message color="yellow" header={approversInfo} content=""></Message>
                </div>
                <div style={{ marginTop: "10px" }}>
                    <div>
                        <h3>Withdraw list</h3>
                        <Link route="new">
                            <a>
                                <Button floated="right" content="Request Withdraw" icon="add circle" color="blue"/>
                            </a>
                        </Link>
                    </div>
                    <div style={{ marginTop: "70px" }}>
                        <Table>
                            <Header>
                                <Row>
                                <HeaderCell>ID</HeaderCell>
                                <HeaderCell>Description</HeaderCell>
                                <HeaderCell>Amount</HeaderCell>
                                <HeaderCell>Recipient</HeaderCell>
                                <HeaderCell>Approval Count</HeaderCell>
                                <HeaderCell>Approve</HeaderCell>
                                <HeaderCell>Finalize</HeaderCell>
                                </Row>
                            </Header>
                            <Body>{this.renderRows()}</Body>
                        </Table>
                        <div>Found {this.props.requestsCount} withdraws.</div>
                    </div>
                </div>
            </Layout>
        );
    }
}

export default TreasureIndex;