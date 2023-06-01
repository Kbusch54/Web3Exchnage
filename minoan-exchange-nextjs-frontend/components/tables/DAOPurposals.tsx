
import React, { use } from 'react';
import request, { gql } from 'graphql-request';
import { supabase } from '../../supabase';
import SingleProposal from './SingleProposal';
import { Address } from 'wagmi';

interface Props {
    daoAddress: string;
    user: Address;
    tokenId: number;
}

const fetchPurposals = async (daoId: string) => {
    const query = gql`
    query ($daoId: String!) {
        proposals {
        proposedAt
        nonce
        isPassed
        to
        proposer
        data
        transactionHash
        dAO {
          id
          votesNeededPercentage
          tokenId
          maxVotingPower
          minVotingPower
            votingTime
          poolToken{
            tokenBalance{
              user{
				id						
              }
            }
          }
      }
    }
    }
  `;
    const endpoint =
        'https://api.studio.thegraph.com/query/46803/subgraph-minoan/v0.1.3';
    const variables = { daoId: daoId };
    const data = await request(endpoint, query, variables);

    return data;
};

const checkUserStakes = async (userId: string, inputTokenId: number) => {
    const query = gql`
      query CheckUserStakes($userId: String!) {
        users(where: { id: $userId }) {
          id
          stakes {
            totalStaked
            token {
              tokenId
            }
          }
        }
      }
    `;
    const endpoint =
      'https://api.studio.thegraph.com/query/46803/subgraph-minoan/v0.1.3';
    const variables = { userId: userId };
    const data = await request(endpoint, query, variables);
  
    //@ts-ignore
    const user = data.users[0];
    let hasStakes = false;
    for (let i = 0; i < user.stakes.length; i++) {
      if (user.stakes[i].token.tokenId === inputTokenId && user.stakes[i].totalStaked > 0) {
        hasStakes = true;
      }
    }
   
    return hasStakes;
  };
  
  
  
  

const DAOPurposals = ({ daoAddress, user,tokenId }: Props) => {
    //@ts-ignore
    const { proposals } = use(fetchPurposals(daoAddress));
    const hasStakes = use(checkUserStakes(user,tokenId));
    //@ts-ignore
    const { data, error } = use(supabase.from('Proposals').select());
    const nonceMap = new Map();
    //@ts-ignore
    data.forEach((proposals) => {
        nonceMap.set(proposals.nonce, proposals);
    });
    if (proposals) {
        return (
            <div className='border-2 border-amber-400/20 flex flex-col bg-slate-900 shadow-lg shadow-amber-400 rounded-2xl'>
                <div className='grid grid-cols-6 justify-evenly text-center '>
                    <div className='text-white text-md lg:text-xl m-2'>Nonce</div>
                    <div className='text-white text-md lg:text-xl m-2'>Etherscan</div>
                    <div className='text-white text-md lg:text-xl m-2'>Expiration</div>
                    <div className='text-white text-md lg:text-xl m-2'>Votes %</div>
                    <div className='text-white text-md lg:text-xl m-2'>Vote Threshhold</div>
                    <div className='text-white text-md lg:text-xl m-2'></div>
                </div>
                <hr className='border-white' />
                {proposals.map((proposal: any,index: number) => {
                    if (nonceMap.get(Number(proposal.nonce))) {
                    }
                    let nonceMapData = nonceMap.get(Number(proposal.nonce));

                    return (
                        <SingleProposal type={'passed'} user={user} key={proposal.nonce} proposal={proposal} dbData={nonceMapData} index={index} isHolder={hasStakes}/>
                    )
                })}
            </div>
        );
    } else {
        return <div className='text-white'>no data</div>;
    }
};

export default DAOPurposals;
