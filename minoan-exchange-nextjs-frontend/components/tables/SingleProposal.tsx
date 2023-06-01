'use client';
import React, { useState, useEffect } from 'react'
import { Address } from 'wagmi';
import VotingProportion from './utils/VotingProportion';
import CountDownProposal from './utils/CountDownProposal';
import DAOButtonSelection from './utils/DAOButtonSelection';

interface Props {
    index: number;
    isHolder: boolean;
    proposal: {
        nonce: number;
        isPassed: boolean;
        to: Address;
        proposer: Address;
        transactionHash: string;
        proposedAt: number;
        data: string;
        dAO: {
            id: Address,
            votesNeededPercentage: number,
            tokenId: number
            maxVotingPower: number,
            minVotingPower: number,
            votingTime: number;
            poolToken: {
                tokenBalance: [
                    {
                        user: {
                            id: Address;
                        }
                    }]
            }
        }
    }

    dbData: {
        nonce: number | null;
        signatures: string[] | null;
        description: string | null;
        etherscanTransactionHash: string | null;
        timeStamp: number | null;
        proposer: Address | null;
        contractAddress: Address | null;
        contractNonce: string | null;
        transactionHashToSign: string | null;
        executor: Address | null;
        isProposalPassed: boolean | null;
        result: string | null;
        signers: Address[] | null;

    }
    user: Address;
    type: string
}

const SingleProposal: React.FC<Props> = ({ proposal, dbData, index, user, isHolder, type }) => {
    const [toggle, setToggle] = useState<boolean>(true)
    const [votesReceived, setVotesReceived] = useState<number>(0)
    const currentTime = new Date().getTime();
    const initialTimestamp = proposal.proposedAt * 1000;
    const window = proposal.dAO.votingTime * 1000;
    const targetTime = initialTimestamp + window;
    const timeLeft = targetTime - currentTime




    const handleToggle = () => {
        setToggle(!toggle)
    }
    useEffect(() => {
        index == 0 && handleToggle()
    }, [])
    useEffect(() => {
    }, [votesReceived])

    if (type === 'current' && (proposal.isPassed || timeLeft <= 0)) {
        return null
    } else if (type === 'passed' && !proposal.isPassed) {
        return null
    } else if (type === 'failed' && proposal.isPassed) {
        return null
    } else {


        return (
            <div>
                <div className='grid grid-cols-6 justify-evenly text-center border border-amber-400/40 rounded-lg' key={proposal.nonce}>
                    <div className='text-white text-md  lg:text-xl m-2 gap-x-3 relative'>
                        <button onClick={handleToggle} className='absolute left-2'>{'->'}</button>
                        <div className=''>{proposal.nonce}</div>
                    </div>
                    <div className='text-white text-md  lg:text-xl m-2'>{dbData?.etherscanTransactionHash ? (
                        <p>{dbData.etherscanTransactionHash.slice(0, 10)}</p>) : (<p>no etheerscan</p>)}
                    </div>
                    <div className='text-white text-md  lg:text-xl m-2'>
                        {type != 'passed' ? (

                            <CountDownProposal initialTimestamp={proposal.proposedAt * 1000} window={proposal.dAO.votingTime * 1000} />
                        ) : (
                            <p className='text-green-500'>Passsed</p>
                        )}
                    </div>
                    <div className='text-white text-md  lg:text-xl m-2'> {dbData?.signers ? (
                        <VotingProportion signers={dbData.signers} maxVotingPower={proposal.dAO.maxVotingPower} minVotingPower={proposal.dAO.minVotingPower} tokenId={proposal.dAO.tokenId} func={setVotesReceived} />
                    ) : (<p>0%</p>)}</div>
                    <div className='text-white text-md  lg:text-xl m-2'>{proposal.dAO.votesNeededPercentage / 10 ** 2}%</div>
                    {type === 'current' && (
                        <DAOButtonSelection dbData={dbData} isHolder={isHolder} proposal={proposal} user={user} votesReceived={votesReceived} />
                    )}
                    {type === 'passed' && (
                        <button className='text-white text-md  lg:text-xl m-2 bg-green-500 rounded-3xl px-2 py-1'>Success</button>
                    )}
                    {type === 'failed' && (
                        <button className='text-white text-md  lg:text-xl m-2 bg-red-500 rounded-3xl px-2 py-1'>Failed</button>
                    )}
                </div>
                <div className={`bg-slate-800 ${toggle ? 'hidden' : 'block'}`}>
                    <div className='text-white text-xl m-2 text-left'>Information</div>
                    <div className='grid grid-cols-2  lg:grid-cols-3 justify-evenly text-center border border-amber-400/40 rounded-lg gap-y-4 bg-slate-700'>
                        <div className='text-white text-lg flex flex-row border justify-evenly text-center border-white/10'>
                            <p>Proposer:</p>
                            <p>{proposal.proposer.slice(0, 10)}</p>
                        </div>
                        <div className='text-white text-lg flex flex-row border justify-evenly text-center border-white/10'>
                            <p>To:</p>
                            <p>{proposal.to.slice(0, 10)}</p>
                        </div>
                        <div className='text-white text-lg flex flex-row border justify-evenly text-center border-white/10'>
                            <p># of Signers:</p>
                            <p>{dbData ? dbData.signers?.length : 0}</p>
                        </div>
                        <div className='text-white text-lg flex flex-row border justify-evenly text-center border-white/10'>
                            <p>Created:</p>
                            <p>{proposal.proposedAt}</p>
                        </div>
                        <div className='text-white text-sm lg:text-lg flex flex-row border justify-evenly text-center border-white/10 col-span-2'>
                            <p className='text-sm lg:text-lg'>TransactionHash:</p>
                            <p className='text-sm lg:text-lg'>{proposal.transactionHash.slice(0, 15)}{'...[copy]'}</p>
                        </div>
                        {dbData && (
                            <div className='text-white text-md lg:text-lg flex flex-row border gap-x-4 text-left m-1 border-white/10 col-span-2 lg:col-span-3'>
                                <p className='ml-6'>Description:</p>
                                <p className='overflow-auto'>{dbData.description}</p>
                            </div>)}
                            {type === 'passed'&&(
                                <>
                                <div className='text-white text-lg flex flex-row border justify-evenly text-center border-white/10'>
                                <p>Executor:</p>
                                <p>{dbData? dbData?.executor?  dbData.executor?.slice(0,10):'0x0':'0x0'}</p>
                            </div>
                            <div className='text-white text-lg flex flex-row border justify-evenly text-center border-white/10'>
                                <p>Result:</p>
                                <p>{dbData? dbData?.result?  dbData.result?.slice(0,10):'0x0':'0x0'}</p>
                            </div>
                                </>
                            )}

                    </div>
                </div>
            </div>
        )
    }
}


export default SingleProposal
